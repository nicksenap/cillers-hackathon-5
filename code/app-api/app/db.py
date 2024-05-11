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
    first_name: str
    last_name: str
    email: str
    signed: bool


def create_product(name: str) -> Product:
    id = str(uuid.uuid1())
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='products',
                         key=id,
                         data={'name': name}))
    return Product(id=id, name=name)

def create_document(name: str, signed: bool, first_name: str, last_name: str, email: str) -> Document:
    id = str(uuid.uuid1())
    cb.insert(env.get_couchbase_conf(),
              cb.DocSpec(bucket=env.get_couchbase_bucket(),
                         collection='documents',
                         key=id,
                         data={'name': name, 'signed': signed, 'first_name': first_name, 'last_name': last_name, 'email': email}))
    return Document(id=id, name=name, signed=signed, first_name=first_name, last_name=last_name, email=email)

def get_document(id: str) -> Document | None:
    if doc := cb.get(env.get_couchbase_conf(),
                     cb.DocRef(bucket=env.get_couchbase_bucket(),
                               collection='documents',
                               key=id)):
        return Document(id=id, name=doc['name'], signed=doc['signed'], first_name=doc['first_name'], last_name=doc['last_name'], email=doc['email'])

#
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
