import datetime
import hashlib
import uuid
import strawberry
from . import couchbase as cb, env

@strawberry.type
class Product:
    id: str
    name: str

@strawberry.type
class Document:
    id: str
    name: str
    content: str
    first_name: str
    last_name: str
    email: str
    checksum: str

@strawberry.type
class Signature:
    id: str
    document: Document
    signed_by_email: str
    signed_content: str
    signed_checksum: str
    signed_ts: str

@strawberry.type
class Field:
    id: str
    name: str
    type: str

@strawberry.type
class Template:
    id: str
    name: str
    fields: list[Field]
    template: str

def create_signature(document_id: str, signed_by_email: str, signed_content: str) -> Signature:
    id = str(uuid.uuid1())
    checksum = hashlib.sha256(signed_content.encode()).hexdigest()
    ts = datetime.datetime.now().isoformat()
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='signatures',
                         key=id,
                         data={'document_id': document_id, 'signed_by_email': signed_by_email, 'signed_content': signed_content, 'signed_checksum': checksum, 'signed_ts': ts}))
    return Signature(id=id, document=get_document(document_id), signed_by_email=signed_by_email, signed_content=signed_content, signed_checksum=checksum, signed_ts=ts)

def create_product(name: str) -> Product:
    id = str(uuid.uuid1())
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='products',
                         key=id,
                         data={'name': name}))
    return Product(id=id, name=name)

def create_document(name: str, first_name: str, last_name: str, email: str, content: str) -> Document:
    id = str(uuid.uuid1())
    checksum = hashlib.sha256(content.encode()).hexdigest()
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='documents',
                         key=id,
                         data={'name': name, 'content': content, 'checksum': checksum, 'first_name': first_name, 'last_name': last_name, 'email': email}))
    return Document(id=id, name=name, content=content, checksum=checksum, first_name=first_name, last_name=last_name, email=email)

def create_field(name: str, type: str) -> Field:
    id = str(uuid.uuid1())
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='fields',
                         key=id,
                         data={'name': name, 'type': type}))
    return Field(id=id, name=name, type=type)

def create_template(name: str, template: str, field_ids: list[str]) -> Template:
    id = str(uuid.uuid1())
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='templates',
                         key=id,
                         data={'name': name, 'field_ids': field_ids, 'template': template}))
    return Template(id=id, name=name, template=template, fields=[get_field(id) for id in field_ids])

def list_documents() -> list[Document]:
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT name, content, checksum, first_name, last_name, email, META().id FROM {env.get_couchbase_bucket()}._default.documents"
    )
    return [Document(id=r['id'], name=r['name'], content=r['content'], checksum=r['checksum'], first_name=r['first_name'], last_name=r['last_name'], email=r['email']) for r in result]

def list_signatures() -> list[Signature]:
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT document_id, signed_by_email, signed_content, signed_checksum, signed_ts, META().id FROM {env.get_couchbase_bucket()}._default.signatures"
    )
    return [Signature(id=r['id'], document=get_document(r['document_id']), signed_by_email=r['signed_by_email'], signed_content=r['signed_content'], signed_checksum=r['signed_checksum'], signed_ts=r['signed_ts']) for r in result]

def get_signature(id: str) -> Signature | None:
    if doc := cb.get(env.get_couchbase_conf(),
                     cb.DocRef(bucket=env.get_couchbase_bucket(),
                               collection='signatures',
                               key=id)):
        doc = doc.value
        return Signature(id=id, document=get_document(doc['document_id']), signed_by_email=doc['signed_by_email'], signed_content=doc['signed_content'], signed_checksum=doc['signed_checksum'], signed_ts=doc['signed_ts'])

def get_signature_by_document_id(document_id: str) -> Signature | None:
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT META().id FROM {env.get_couchbase_bucket()}._default.signatures WHERE document_id = $1",
        document_id
    )
    if result:
        return get_signature(result[0]['id'])
    return None

def verify_signature(id: str) -> Signature | None:
    if signature_doc := cb.get(env.get_couchbase_conf(),
                               cb.DocRef(bucket=env.get_couchbase_bucket(),
                                         collection='signatures',
                                         key=id)):
        signature_doc = signature_doc.value
        document = get_document(signature_doc['document_id'])
        if document and signature_doc['signed_checksum'] == hashlib.sha256(document.content.encode()).hexdigest():
            return Signature(id=id, document=document, signed_by_email=signature_doc['signed_by_email'], signed_content=signature_doc['signed_content'], signed_checksum=signature_doc['signed_checksum'], signed_ts=signature_doc['signed_ts'])
    return None

def get_document(id: str) -> Document | None:
    if doc := cb.get(env.get_couchbase_conf(),
                     cb.DocRef(bucket=env.get_couchbase_bucket(),
                               collection='documents',
                               key=id)):
        doc = doc.value
        return Document(id=id, name=doc['name'], content=doc['content'], checksum=doc['checksum'], first_name=doc['first_name'], last_name=doc['last_name'], email=doc['email'])

def delete_document(id: str) -> None:
    cb.remove(env.get_couchbase_conf(),
              cb.DocRef(bucket=env.get_couchbase_bucket(),
                        collection='documents',
                        key=id))
    
def get_field(id: str) -> Field | None:
    if doc := cb.get(env.get_couchbase_conf(),
                     cb.DocRef(bucket=env.get_couchbase_bucket(),
                               collection='fields',
                               key=id)):
        doc = doc.value
        return Field(id=id, name=doc['name'], type=doc['type'])

def delete_field(id: str) -> None:
    cb.remove(env.get_couchbase_conf(),
              cb.DocRef(bucket=env.get_couchbase_bucket(),
                        collection='fields',
                        key=id))
    
def list_fields() -> list[Field]:
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT name, type, META().id FROM {env.get_couchbase_bucket()}._default.fields"
    )
    return [Field(**r) for r in result]

def get_template(id: str) -> Template | None:
    if doc := cb.get(env.get_couchbase_conf(),
                     cb.DocRef(bucket=env.get_couchbase_bucket(),
                               collection='templates',
                               key=id)):
        doc = doc.value
        return Template(id=id, name=doc['name'], fields=doc['fields'])

def delete_template(id: str) -> None:
    cb.remove(env.get_couchbase_conf(),
              cb.DocRef(bucket=env.get_couchbase_bucket(),
                        collection='templates',
                        key=id))

def list_templates() -> list[Template]:
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT name, field_ids, template, META().id as id FROM {env.get_couchbase_bucket()}._default.templates"
    )
    templates = []
    for r in result:
        field_ids = r.get('field_ids', [])
        fields = [get_field(field_id) for field_id in field_ids]  # Ensure this returns a list of Field objects
        templates.append(Template(id=r['id'], name=r['name'], fields=fields, template=r['template']))
    return templates

def get_product(id: str) -> Product | None:
    if doc := cb.get(env.get_couchbase_conf(),
                     cb.DocRef(bucket=env.get_couchbase_bucket(),
                               collection='products',
                               key=id)):
        return Product(id=id, name=doc['name'])

def delete_product(id: str) -> None:
    cb.remove(env.get_couchbase_conf(),
              cb.DocRef(bucket=env.get_couchbase_bucket(),
                        collection='products',
                        key=id))

def list_products() -> list[Product]:
    result = cb.exec(
        env.get_couchbase_conf(),
        f"SELECT name, META().id FROM {env.get_couchbase_bucket()}._default.products"
    )
    return [Product(**r) for r in result]
