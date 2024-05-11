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
    

def create_signature(document_id: str, signed_by_email: str, signed_content: str, signed_ts: str) -> Signature:
    id = str(uuid.uuid1())
    checksum = hashlib.sha256(signed_content.encode()).hexdigest()
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='signatures',
                         key=id,
                         data={'document_id': document_id, 'signed_by_email': signed_by_email, 'signed_checksum': checksum, 'signed_ts': signed_ts}))
    return Signature(id=id, document=get_document(document_id), signed_by_email=signed_by_email, signed_checksum=checksum, signed_ts=signed_ts)

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
