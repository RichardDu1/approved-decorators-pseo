import json
import random
import os

SERVICES = [
    {
        "id": "exterior-house-painting",
        "name": "Exterior House Painting",
        "base_price": 800,
        "description": "Professional exterior painting and weather protection."
    },
    {
        "id": "commercial-office-decorators",
        "name": "Commercial Office Decorators",
        "base_price": 1200,
        "description": "High-quality commercial painting for offices and retail spaces."
    },
    {
        "id": "wallpaper-hanging-specialists",
        "name": "Premium Wallpaper Hanging",
        "base_price": 400,
        "description": "Specialist wallpaper hanging for luxury and feature walls."
    },
    {
        "id": "kitchen-cabinet-spray-painting",
        "name": "Kitchen Cabinet Spray Painting",
        "base_price": 600,
        "description": "Transform your kitchen with a factory-finish spray paint."
    }
]

LONDON_BOROUGHS = [
    "Camden", "Greenwich", "Hackney", "Hammersmith and Fulham", "Islington",
    "Kensington and Chelsea", "Lambeth", "Southwark", "Tower Hamlets", "Wandsworth",
    "Westminster", "Richmond upon Thames", "Ealing", "Hounslow", "Barnet"
]

UK_CITIES = [
    "Birmingham", "Manchester", "Glasgow", "Liverpool", "Bristol", 
    "Leeds", "Sheffield", "Edinburgh", "Cardiff", "Nottingham",
    "Leicester", "Newcastle", "Southampton", "Derby", "Brighton"
]

ALL_LOCATIONS = []

for borough in LONDON_BOROUGHS:
    ALL_LOCATIONS.append({
        "id": borough.lower().replace(" ", "-"),
        "name": borough,
        "region": "London",
        "is_london": True,
        "postcode_prefix": random.choice(["N", "NW", "E", "EC", "W", "WC", "SE", "SW"])
    })

for city in UK_CITIES:
    ALL_LOCATIONS.append({
        "id": city.lower().replace(" ", "-"),
        "name": city,
        "region": "UK",
        "is_london": False,
        "postcode_prefix": city[:2].upper()
    })

def get_architecture_pain_points(location, service_id):
    pain_points = []
    if location["is_london"]:
        if "exterior" in service_id:
            pain_points.append("Navigating strict conservation area regulations in London.")
            pain_points.append("Dealing with London's pollution and weathering on Victorian brickwork.")
        elif "wallpaper" in service_id:
            pain_points.append("Working around period features, picture rails and high ceilings in London townhouses.")
        elif "commercial" in service_id:
            pain_points.append("Out of hours working to minimize disruption in busy London office districts.")
        else:
            pain_points.append("Optimising space in compact London kitchens during the spraying process.")
    elif location["name"] in ["Glasgow", "Edinburgh"]:
        pain_points.append("Specialist preparation for traditional stone and red sandstone properties.")
    elif location["name"] in ["Bristol", "Brighton"]:
        pain_points.append("Providing extra protection against coastal and damp air environments.")
    else:
        pain_points.append(f"Matching the diverse architectural styles found across {location['name']}.")
        
    return pain_points

def generate_nearby_areas(current_location, all_locations, count=3):
    same_region = [loc for loc in all_locations if loc["region"] == current_location["region"] and loc["id"] != current_location["id"]]
    if not same_region:
        return []
    selected = random.sample(same_region, min(count, len(same_region)))
    return [{"id": s["id"], "name": s["name"]} for s in selected]

def generate_pricing(base_price, is_london):
    multiplier = 1.3 if is_london else 1.0
    return {
        "small": int(base_price * multiplier * 0.8),
        "medium": int(base_price * multiplier * 1.2),
        "large": int(base_price * multiplier * 1.8)
    }

def generate_faqs(service, location):
    return [
        {
            "question": f"How long does {service['name'].lower()} take in {location['name']}?",
            "answer": f"For a typical property in {location['name']}, our {service['name'].lower()} service takes between 2 to 5 days, depending on the scope and size of the project."
        },
        {
            "question": f"Do you provide a guarantee for your work in {location['name']}?",
            "answer": f"Yes, all our painting and decorating jobs in {location['name']} come with a comprehensive 12-month guarantee for your peace of mind."
        },
        {
            "question": f"Are your decorators fully insured to work in {location['name']}?",
            "answer": f"Absolutely. We hold £2M Public Liability Insurance, covering all our work across {location['name']} and surrounding areas."
        }
    ]

dataset = []

for service in SERVICES:
    for location in ALL_LOCATIONS:
        entry = {
            "service": service,
            "location": location,
            "architecture_context": {
                "pain_points": get_architecture_pain_points(location, service["id"])
            },
            "economic_context": {
                "pricing": generate_pricing(service["base_price"], location["is_london"]),
                "faqs": generate_faqs(service, location)
            },
            "proximity_context": {
                "nearby_areas": generate_nearby_areas(location, ALL_LOCATIONS)
            }
        }
        dataset.append(entry)

os.makedirs("src/data", exist_ok=True)
with open("src/data/pseo_data.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, indent=2, ensure_ascii=False)

print(f"Generated 5D dataset with {len(dataset)} pages.")
