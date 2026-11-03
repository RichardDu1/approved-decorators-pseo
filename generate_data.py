import json
import math
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

# Main postcode areas and approximate centre coordinates for each location.
# Postcode areas follow Royal Mail's postcode area codes (e.g. Glasgow = G,
# Brighton = BN). London boroughs span several areas, so all main ones are listed.
LONDON_BOROUGHS = [
    ("Camden", ["NW", "N", "WC"], 51.5517, -0.1588),
    ("Greenwich", ["SE"], 51.4892, 0.0648),
    ("Hackney", ["E", "N"], 51.5450, -0.0553),
    ("Hammersmith and Fulham", ["W", "SW"], 51.4927, -0.2339),
    ("Islington", ["N", "EC"], 51.5465, -0.1058),
    ("Kensington and Chelsea", ["SW", "W"], 51.4991, -0.1938),
    ("Lambeth", ["SE", "SW"], 51.4571, -0.1231),
    ("Southwark", ["SE"], 51.4734, -0.0755),
    ("Tower Hamlets", ["E"], 51.5150, -0.0350),
    ("Wandsworth", ["SW"], 51.4567, -0.1910),
    ("Westminster", ["W", "SW", "WC", "NW"], 51.5120, -0.1500),
    ("Richmond upon Thames", ["TW", "SW"], 51.4479, -0.3260),
    ("Ealing", ["W", "UB"], 51.5130, -0.3089),
    ("Hounslow", ["TW", "W"], 51.4609, -0.3731),
    ("Barnet", ["N", "NW", "EN"], 51.6252, -0.1517),
]

UK_CITIES = [
    ("Birmingham", ["B"], 52.4862, -1.8904),
    ("Manchester", ["M"], 53.4808, -2.2426),
    ("Glasgow", ["G"], 55.8642, -4.2518),
    ("Liverpool", ["L"], 53.4084, -2.9916),
    ("Bristol", ["BS"], 51.4545, -2.5879),
    ("Leeds", ["LS"], 53.8008, -1.5491),
    ("Sheffield", ["S"], 53.3811, -1.4701),
    ("Edinburgh", ["EH"], 55.9533, -3.1883),
    ("Cardiff", ["CF"], 51.4816, -3.1791),
    ("Nottingham", ["NG"], 52.9548, -1.1581),
    ("Leicester", ["LE"], 52.6369, -1.1398),
    ("Newcastle", ["NE"], 54.9783, -1.6178),
    ("Southampton", ["SO"], 50.9097, -1.4044),
    ("Derby", ["DE"], 52.9225, -1.4746),
    ("Brighton", ["BN"], 50.8225, -0.1372),
]

ALL_LOCATIONS = []

for name, areas, lat, lon in LONDON_BOROUGHS:
    ALL_LOCATIONS.append({
        "id": name.lower().replace(" ", "-"),
        "name": name,
        "region": "London",
        "is_london": True,
        "postcode_areas": areas,
        "lat": lat,
        "lon": lon
    })

for name, areas, lat, lon in UK_CITIES:
    ALL_LOCATIONS.append({
        "id": name.lower().replace(" ", "-"),
        "name": name,
        "region": "UK",
        "is_london": False,
        "postcode_areas": areas,
        "lat": lat,
        "lon": lon
    })

def distance_miles(a, b):
    """Great-circle (straight-line) distance between two locations in miles."""
    r = 3958.8
    p1, p2 = math.radians(a["lat"]), math.radians(b["lat"])
    dp, dl = p2 - p1, math.radians(b["lon"] - a["lon"])
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))

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
    """The closest other covered locations in the same region, nearest first."""
    same_region = [loc for loc in all_locations if loc["region"] == current_location["region"] and loc["id"] != current_location["id"]]
    same_region.sort(key=lambda loc: distance_miles(current_location, loc))
    return [
        {"id": s["id"], "name": s["name"], "distance_miles": round(distance_miles(current_location, s))}
        for s in same_region[:count]
    ]

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
