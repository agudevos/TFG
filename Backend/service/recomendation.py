import json
from openai import OpenAI
import pandas as pd
from typing import Dict, List, Any


# Procesar y analizar los datos históricos
def analyze_historical_data(data: pd.DataFrame) -> Dict[str, Any]:
    """
    Analiza los datos históricos para extraer información relevante.
    
    Args:
        data: DataFrame con datos históricos
        
    Returns:
        Diccionario con análisis y estadísticas
    """
    print(data)
    # Calcular métricas relevantes
    analysis = {
        "has_data": True,
        "avg_price": data['price'].mean(),
        "median_price": data['price'].median(),
        "min_price": data['price'].min(),
        "max_price": data['price'].max(),
        "price_to_max_ratio": data['max_reservation'].mean() / data['price'].mean() if data['price'].mean() > 0 else 0,
        "sample_size": len(data)
    }
    
    # Segmentación por condición del ítem
    category_analysis = data.groupby('category').agg({
        'price': ['mean', 'median']
    }).reset_index()

    type_analysis = data.groupby('type').agg({
        'price': ['mean', 'median']
    }).reset_index()

    analysis["type_analysis"] = type_analysis.to_dict()
    
    analysis["category_segments"] = category_analysis.to_dict()
    
    return analysis

# Función principal para generar recomendaciones
def generate_service_price_recomendation(
    api_key: str,
    historical_data_list: List[Dict],
    service: dict,
    slot: dict,
) -> Dict[str, Any]:
    """
    Genera una recomendación de starting_bid para una nueva subasta.
    
    Args:
        connection_string: String de conexión a la BD
        api_key: API key para el modelo LLM
        item_category: Categoría del ítem
        item_condition: Condición del ítem
        estimated_value: Valor estimado por el vendedor
        urgency: Urgencia de venta (1-10)
        seller_rating: Calificación del vendedor
        
    Returns:
        Diccionario con la recomendación y justificación
    """
    historical_data = pd.DataFrame(historical_data_list)

    # Analizar datos históricos
    analysis = analyze_historical_data(historical_data)
    
    print(analysis)

    template = f"""
    Como experto en servicios de bares como futbolines, mesas de billar, dianas de dardos.., tu tarea es recomendar un precio de reserva por hora óptimo 
    para un nuevo servicio dentro de un tramo horario determinado.
    
    DATOS DEL SERVICIO A RESERVAR:
    - Servicio: {service}
    - Tramo horario: {slot}
    - Urgencia de venta (1-10): 8
    
    DATOS HISTORICOS:
    {historical_data}

    ANÁLISIS DE DATOS HISTÓRICOS:
    {analysis}

    Tu objetivo es obtener el precio de reserva más óptimo. Para ello debes conocer que los tramos horarios pueden ser de dos tipos, weekly o 
    specific (días especiales en los que los precios de reserva suelen ser más caros), analiza que tramo horario tiene el servicio a reservar, ya sea
    de un día festivo o laboral, entre semana o fin de semana, mañana medio día o tarde, y comparalo con el precio que suelen tener los servicios durante tramos 
    horarios similares en el análisis de datos historicos, es decir si el tramo horario es de tipo especific fijate en la media de precio unicamente para ese type, y igualmente
    para tramos horarios con type weekly te fijaras unicamente en la media de precio para weekly. Para mayor precisión analiza también la categoría del servicio a reservar y compara los precios 
    de servicios unicamente con categorias similares en el análisis de datos historicos.

    1. Una recomendación de starting_bid óptimo (valor numérico)
    2. Un rango recomendado (mínimo y máximo)

    responde unicamente con un JSON con el siguiente formato:
    
        "rango": str,
        "optimo": integer
    

    EJEMPLO 1:

    DATOS DEL SERVICIO A RESERVAR:
    - Servicio: {{'id': 123487, 'name': 'Mesa de billar profesional', 'description': 'Mesa de billar profesional perfecta para torneos o practicar para ellos', 'category': 'billar', 'max_reservation': 60, 'deposit': 30}}
    - Tramo horario: {{'id': 2, 'time_slot': 1, 'time_slot_details': {{'id': 1, 'name': 'Mañana', 'start_time': '09:00:00', 'end_time': '15:00:00', 'color': '#3498db'}}, 'weekly_schedule': 1, 'group_schedule': None, 'specific_schedule': None, 'order': 1, 'notes': None}}
    - Urgencia de venta (1-10): 8
    
    DATOS HISTORICOS:
    [{{'id': 2, 'price': 2.0, 'category': 'televisión', 'max_reservation': 20, 'start_time': datetime.time(9, 0), 'end_time': datetime.time(15, 0), 'type': 'weekly', 'weekday': 0}},
    {{'id': 3, 'price': 2.0, 'category': 'televisión', 'max_reservation': 20, 'start_time': datetime.time(9, 0), 'end_time': datetime.time(15, 0), 'type': 'weekly', 'weekday': 1}}, 
    {{'id': 4, 'price': 10.0, 'category': 'televisión', 'max_reservation': 20, 'start_time': datetime.time(19, 0), 'end_time': datetime.time(21, 0), 'type': 'specific', 'date': datetime.date(2025, 4, 7)}},
    {{'id': 5, 'price': 100.0, 'category': 'billar, profesional', 'max_reservation': 60, 'start_time': datetime.time(9, 0), 'end_time': datetime.time(15, 0), 'type': 'weekly', 'weekday': 0}}]

    ANÁLISIS DE DATOS HISTÓRICOS:
    {{'has_data': True, 'avg_price': np.float64(28.5), 'median_price': np.float64(6.0), 'min_price': np.float64(2.0), 'max_price': np.float64(100.0), 'price_to_max_ratio': np.float64(1.0526315789473684), 'sample_size': 4, 'type_analysis': {{('type', ''): {{0: 'specific', 1: 'weekly'}}, ('price', 'mean'): {{0: 10.0, 1: 34.666666666666664}}, ('price', 'median'): {{0: 10.0, 1: 2.0}}}}, 'category_segments': {{('category', ''): {{0: 'billar, profesional', 1: 'televisión'}}, ('price', 'mean'): {{0: 100.0, 1: 4.666666666666667}}, ('price', 'median'): {{0: 100.0, 1: 2.0}}}}}}
    

    SALIDA:
    
        rango: "90-110",
        optimo: 99
    
    RAZONAMIENTO:

    El servicio tiene como categoria "billar", por lo que se toma en consideracion los datos historicos cuyas categorias contengan la palabra billar, en este caso la media de precio
    para esa categoria es 100 por lo que daremos como salida un rango alrededor de 100 (90-110) y un precio competitivo de 99
    
    Tu recomendación debe balancear el beneficio economico para el dueño con la reserva y la atracción de clientes dando un precio competitivo..
    """

   
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # o "gpt-4o-mini"
        messages=[
            {"role": "system", "content": template},
            {"role": "user", "content": "Dame una recomendacion de precio de reserva por hora para mi servicio con los datos que tienes"},
        ],
        temperature=0.7,
    )
    
    raw_content = response.choices[0].message.content

    # 2. Limpiar el bloque ```json ... ```
    cleaned = raw_content.strip("`")  # quita los backticks
    cleaned = cleaned.replace("json", "", 1).strip()  # quita la palabra "json" si está al inicio

    # 3. Parsear el contenido JSON
    try:
        recomendation = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print("Error al parsear JSON:", e)
    
    return recomendation


