import os
import sys
import django
import random
import requests
from decimal import Decimal

# Añadir el directorio base de Django al sys.path
base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(base_dir, 'skincage'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skincage.settings')
django.setup()

from skins.models import Skin, Categoria, Rareza
from images.models import Imagen

def get_categoria(weapon_name, category_name):
    cat_lower = category_name.lower()
    weapon_lower = weapon_name.lower()

    if 'pistol' in cat_lower: return Categoria.PISTOL
    if 'smg' in cat_lower: return Categoria.SMG
    if 'sniper' in cat_lower: return Categoria.SNIPER
    if 'rifle' in cat_lower: return Categoria.RIFLE
    if 'shotgun' in cat_lower: return Categoria.SHOTGUN
    if 'machinegun' in cat_lower or 'machine gun' in cat_lower: return Categoria.MACHINE_GUN
    if 'knife' in cat_lower: return Categoria.KNIFE
    if 'glove' in cat_lower or 'hand wraps' in weapon_lower: return Categoria.GLOVES
    
    # Defaults
    if 'awp' in weapon_lower or 'ssg' in weapon_lower or 'g3sg1' in weapon_lower or 'scar-20' in weapon_lower:
        return Categoria.SNIPER
    if 'ak-47' in weapon_lower or 'm4a4' in weapon_lower or 'm4a1-s' in weapon_lower or 'aug' in weapon_lower or 'sg 553' in weapon_lower or 'famas' in weapon_lower or 'galil' in weapon_lower:
        return Categoria.RIFLE
    if 'glock' in weapon_lower or 'usp' in weapon_lower or 'p250' in weapon_lower or 'deagle' in weapon_lower or 'five-seven' in weapon_lower or 'tec-9' in weapon_lower or 'cz75' in weapon_lower or 'r8' in weapon_lower or 'dual berettas' in weapon_lower:
        return Categoria.PISTOL
    if 'mac-10' in weapon_lower or 'mp9' in weapon_lower or 'mp7' in weapon_lower or 'ump-45' in weapon_lower or 'p90' in weapon_lower or 'bizon' in weapon_lower:
        return Categoria.SMG
    if 'nova' in weapon_lower or 'xm1014' in weapon_lower or 'mag-7' in weapon_lower or 'sawed-off' in weapon_lower:
        return Categoria.SHOTGUN
    if 'm249' in weapon_lower or 'negev' in weapon_lower:
        return Categoria.MACHINE_GUN
        
    return Categoria.RIFLE # default fallback

def get_rareza(rarity_name):
    rarity = rarity_name.lower()
    if 'consumer' in rarity: return Rareza.CONSUMER
    if 'industrial' in rarity: return Rareza.INDUSTRIAL
    if 'mil-spec' in rarity or 'milspec' in rarity: return Rareza.MIL_SPEC
    if 'restricted' in rarity: return Rareza.RESTRICTED
    if 'classified' in rarity: return Rareza.CLASSIFIED
    if 'covert' in rarity or 'extraordinary' in rarity: return Rareza.COVERT
    if 'contraband' in rarity: return Rareza.CONTRABAND
    return Rareza.MIL_SPEC

def scrape_and_populate(limit=50):
    url = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json"
    print(f"Descargando datos de skins desde: {url}")
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"Error al descargar datos: {response.status_code}")
        return

    skins_data = response.json()
    print(f"Se obtuvieron {len(skins_data)} skins. Insertando {limit}...")

    # Barajar para obtener skins aleatorias
    random.shuffle(skins_data)
    count = 0

    for data in skins_data:
        if count >= limit:
            break
            
        nombre = data.get("name", "Unknown Skin")
        if "Vanilla" in nombre:
            continue
            
        category_obj = data.get("category", {})
        weapon_obj = data.get("weapon", {})
        rarity_obj = data.get("rarity", {})
        
        cat_name = category_obj.get("name", "")
        weap_name = weapon_obj.get("name", "")
        rarity_name = rarity_obj.get("name", "")
        
        categoria = get_categoria(weap_name, cat_name)
        rareza = get_rareza(rarity_name)
        
        min_float = data.get("min_float", 0.0)
        max_float = data.get("max_float", 1.0)
        if min_float is None: min_float = 0.0
        if max_float is None: max_float = 1.0
        
        desgaste = Decimal(random.uniform(min_float, max_float)).quantize(Decimal('0.000000000000'))
        
        stattrack = data.get("stattrak", False)
        
        precio = Decimal(random.uniform(5.0, 500.0)).quantize(Decimal('0.00'))
        stock = random.randint(0, 50)
        
        imagen_url = data.get("image", "")

        if not imagen_url:
            continue

        skin_obj, created = Skin.objects.get_or_create(
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

        if created:
            Imagen.objects.create(id_skin=skin_obj, url=imagen_url)
            print(f"Insertado: {nombre} ({categoria} - {rareza})")
            count += 1
        else:
            # Si ya existía, asegurarse de que tiene imagen
            if not skin_obj.imagenes.exists():
                 Imagen.objects.create(id_skin=skin_obj, url=imagen_url)

    print(f"\n¡Se han insertado {count} nuevas skins en la base de datos!")

if __name__ == "__main__":
    # Insertaremos 500 skins por defecto
    scrape_and_populate(500)
