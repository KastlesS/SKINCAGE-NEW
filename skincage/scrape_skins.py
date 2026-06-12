import os
import sys
import django
import random
import requests
from decimal import Decimal


directorio_base = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(directorio_base, 'skincage'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skincage.settings')
django.setup()

from skins.models import Skin, Categoria, Rareza
from images.models import Imagen

def obtener_categoria(nombre_arma, nombre_categoria):
    categoria_minuscula = nombre_categoria.lower()
    arma_minuscula = nombre_arma.lower()

    if 'pistol' in categoria_minuscula: return Categoria.PISTOL
    if 'smg' in categoria_minuscula: return Categoria.SMG
    if 'sniper' in categoria_minuscula: return Categoria.SNIPER
    if 'rifle' in categoria_minuscula: return Categoria.RIFLE
    if 'shotgun' in categoria_minuscula: return Categoria.SHOTGUN
    if 'machinegun' in categoria_minuscula or 'machine gun' in categoria_minuscula: return Categoria.MACHINE_GUN
    if 'knife' in categoria_minuscula: return Categoria.KNIFE
    if 'glove' in categoria_minuscula or 'hand wraps' in arma_minuscula: return Categoria.GLOVES
    
    if 'awp' in arma_minuscula or 'ssg' in arma_minuscula or 'g3sg1' in arma_minuscula or 'scar-20' in arma_minuscula:
        return Categoria.SNIPER
    if 'ak-47' in arma_minuscula or 'm4a4' in arma_minuscula or 'm4a1-s' in arma_minuscula or 'aug' in arma_minuscula or 'sg 553' in arma_minuscula or 'famas' in arma_minuscula or 'galil' in arma_minuscula:
        return Categoria.RIFLE
    if 'glock' in arma_minuscula or 'usp' in arma_minuscula or 'p250' in arma_minuscula or 'deagle' in arma_minuscula or 'five-seven' in arma_minuscula or 'tec-9' in arma_minuscula or 'cz75' in arma_minuscula or 'r8' in arma_minuscula or 'dual berettas' in arma_minuscula:
        return Categoria.PISTOL
    if 'mac-10' in arma_minuscula or 'mp9' in arma_minuscula or 'mp7' in arma_minuscula or 'ump-45' in arma_minuscula or 'p90' in arma_minuscula or 'bizon' in arma_minuscula:
        return Categoria.SMG
    if 'nova' in arma_minuscula or 'xm1014' in arma_minuscula or 'mag-7' in arma_minuscula or 'sawed-off' in arma_minuscula:
        return Categoria.SHOTGUN
    if 'm249' in arma_minuscula or 'negev' in arma_minuscula:
        return Categoria.MACHINE_GUN
        
    return Categoria.RIFLE 

def obtener_rareza(nombre_rareza):
    rareza_minuscula = nombre_rareza.lower()
    if 'consumer' in rareza_minuscula: return Rareza.CONSUMER
    if 'industrial' in rareza_minuscula: return Rareza.INDUSTRIAL
    if 'mil-spec' in rareza_minuscula or 'milspec' in rareza_minuscula: return Rareza.MIL_SPEC
    if 'restricted' in rareza_minuscula: return Rareza.RESTRICTED
    if 'classified' in rareza_minuscula: return Rareza.CLASSIFIED
    if 'covert' in rareza_minuscula or 'extraordinary' in rareza_minuscula: return Rareza.COVERT
    if 'contraband' in rareza_minuscula: return Rareza.CONTRABAND
    return Rareza.MIL_SPEC

def poblar_base_datos(limite=50):
    url_api = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
    respuesta = requests.get(url_api)
    
    if respuesta.status_code != 200:
        print(f"Error al descargar datos: {respuesta.status_code}")
        return

    datos_skins = respuesta.json()

    random.shuffle(datos_skins)
    contador = 0

    for datos in datos_skins:
        if contador >= limite:
            break
            
        nombre = datos.get("name", "Unknown Skin")
        if "Vanilla" in nombre:
            continue
            
        obj_categoria = datos.get("category", {})
        obj_arma = datos.get("weapon", {})
        obj_rareza = datos.get("rarity", {})
        
        nombre_cat = obj_categoria.get("name", "")
        nombre_arm = obj_arma.get("name", "")
        nombre_rar = obj_rareza.get("name", "")
        
        categoria = obtener_categoria(nombre_arm, nombre_cat)
        rareza = obtener_rareza(nombre_rar)
        
        desgaste_min = datos.get("min_float", 0.0)
        desgaste_max = datos.get("max_float", 1.0)
        if desgaste_min is None: desgaste_min = 0.0
        if desgaste_max is None: desgaste_max = 1.0
        
        desgaste = Decimal(random.uniform(desgaste_min, desgaste_max)).quantize(Decimal('0.000000000000'))
        
        stattrack = datos.get("stattrak", False)
        
        precio = Decimal(random.uniform(5.0, 500.0)).quantize(Decimal('0.00'))
        stock = random.randint(0, 50)
        
        imagen_url = datos.get("image", "")

        if not imagen_url:
            continue

        skin_obj, creada = Skin.objects.get_or_create(
            nombre=nombre,
            defaults={
                'desgaste': desgaste,
                'stattrack': stattrack,
                'precio': precio,
                'stock': stock,
                'categoria': categoria,
                'rareza': rareza,
            }
        )

        if creada:
            Imagen.objects.create(id_skin=skin_obj, url=imagen_url)
            contador += 1
        else:
            if not skin_obj.imagenes.exists():
                 Imagen.objects.create(id_skin=skin_obj, url=imagen_url)

if __name__ == "__main__":
    poblar_base_datos(500)
