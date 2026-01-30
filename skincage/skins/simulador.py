from faker import Faker
from .models import Skin, Rareza, Categoria
from random import choice 

fake = Faker("es_ES")

def crearSkin(n):
    categorias = [c[0] for c in Categoria.choices]
    rarezas = [r[0] for r in Rareza.choices]

    for i in range(n):
        Skin.objects.create(nombre=fake.name(),stattrack=fake.boolean(), desgaste=fake.pydecimal(positive=True, left_digits=1, right_digits=12), precio=fake.pydecimal(positive=True, left_digits=4, right_digits=2),stock = fake.random_number(digits=3), categoria = choice(categorias), rareza = choice(rarezas))
