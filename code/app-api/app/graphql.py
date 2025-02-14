import asyncio
from typing import AsyncGenerator
from functools import cached_property
from typing import Dict
import strawberry
from strawberry.fastapi import BaseContext, GraphQLRouter
from strawberry.permission import BasePermission
from strawberry.types import Info as _Info
from strawberry.types.info import RootValueType
import logging

from . import auth, db

logger = logging.getLogger(__name__)

#### Context ####

class Context(BaseContext):
    @cached_property
    def user(self) -> dict | None:
        if self.request:
            if auth_ := self.request.headers.get("Authorization"):
                method, token = auth_.split(" ")
                if method == 'Bearer':
                    if data := auth.verify_and_decode_jwt(token):
                        return data

async def get_context() -> Context:
    return Context()

Info = _Info[Context, RootValueType]

#### Auth ####

class IsAuthenticated(BasePermission):
    message = "User is not authenticated."

    def has_permission(self, source, info: Info, **kwargs):
        return info.context.user is not None

@strawberry.type
class Message:
    message: str

#### Mutations ####

@strawberry.type
class Mutation:
    @strawberry.field(permission_classes=[IsAuthenticated])
    async def add_product(self, name: str) -> db.Product:
        return db.create_product(name)

    @strawberry.field(permission_classes=[IsAuthenticated])
    async def remove_product(self, id: str) -> None:
        db.delete_product(id)

    @strawberry.field
    async def add_document(self, name: str, content: str, first_name: str, last_name: str, email: str) -> db.Document:
        return db.create_document(name, first_name, last_name, email, content)
    
    @strawberry.field
    async def remove_document(self, id: str) -> None:
        db.delete_document(id)
    
    @strawberry.field
    async def sign_document(self, document_id: str, signed_by_email: str, signed_content: str) -> db.Signature:
        return db.create_signature(document_id, signed_by_email, signed_content)

    @strawberry.field
    async def add_field(self, name: str, type: str) -> db.Field:
        return db.create_field(name, type)
    
    @strawberry.field
    async def remove_field(self, id: str) -> None:
        db.delete_field(id)
    
    @strawberry.field
    async def add_template(self, name: str, template: str, field_ids: list[str]) -> db.Template:
        return db.create_template(name, template, field_ids)
    
    @strawberry.field
    async def remove_template(self, id: str) -> None:
        db.delete_template(id)
#### Queries ####

@strawberry.type
class Query:
    @strawberry.field
    def products(self) -> list[db.Product]:
        return db.list_products()

    @strawberry.field(permission_classes=[IsAuthenticated])
    def hello(self) -> Message:
        return Message(message="Hej, hej")

    @strawberry.field
    def documents(self) -> list[db.Document]:
        return db.list_documents()
    
    @strawberry.field
    def document(self, id: str) -> db.Document | None:
        return db.get_document(id)
    
    @strawberry.field
    def signatures(self) -> list[db.Signature]:
        return db.list_signatures()
    
    @strawberry.field
    def signature(self, id: str) -> db.Signature | None:
        return db.get_signature(id)
    
    @strawberry.field
    def verify_signature(self, id: str) -> db.Signature | None:
        return db.verify_signature(id)
    
    @strawberry.field
    def get_signature_by_document(self, document_id: str) -> db.Signature | None:
        return db.get_signature_by_document_id(document_id)

    @strawberry.field
    def fields(self) -> list[db.Field]:
        return db.list_fields()
    
    @strawberry.field
    def field(self, id: str) -> db.Field | None:
        return db.get_field(id)
    
    @strawberry.field
    def templates(self) -> list[db.Template]:
        return db.list_templates()
    
    @strawberry.field
    def template(self, id: str) -> db.Template | None:
        return db.get_template(id)
#### Subscriptions ####

@strawberry.type
class Subscription:
    @strawberry.subscription
    async def product_added(self) -> AsyncGenerator[db.Product, None]:
        # TODO: use a Kafka topic to avoid polling here
        seen = set(p.id for p in db.list_products())
        while True:
            for p in db.list_products():
                if p.id not in seen:
                    seen.add(p.id)
                    yield p
            await asyncio.sleep(0.5)

#### API ####

def get_app():
    return GraphQLRouter(
        strawberry.Schema(Query, mutation=Mutation, subscription=Subscription),
        context_getter=get_context
    )
