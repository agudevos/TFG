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
        "avg_starting_bid": data['starting_bid'].mean(),
        "median_starting_bid": data['starting_bid'].median(),
        "min_starting_bid": data['starting_bid'].min(),
        "max_starting_bid": data['starting_bid'].max(),
        "avg_quantity": data['quantity'].mean(),
        "price_to_bid_ratio": data['quantity'].mean() / data['starting_bid'].mean() if data['starting_bid'].mean() > 0 else 0,
        "sample_size": len(data)
    }
    
    # Segmentación por condición del ítem
    category_analysis = data.groupby('category').agg({
        'starting_bid': ['mean', 'median'],
        'quantity': ['mean'],
    }).reset_index()

    date_analysis = data.groupby('end_date').agg({
        'starting_bid': ['mean', 'median'],
        'quantity': ['mean'],
    }).reset_index()

    analysis["date_segments"] = date_analysis.to_dict()
    
    analysis["category_segments"] = category_analysis.to_dict()
    
    return analysis

# Función principal para generar recomendaciones
def generate_starting_bid_recommendation(
    api_key: str,
    historical_data_list: List[Dict],
    service_category: str,
    estimated_value: float,
    end_date
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
    Como experto en subastas, tu tarea es recomendar un precio inicial (starting_bid) óptimo para un nuevo ítem a subastar.
    
    DATOS DEL ÍTEM A SUBASTAR:
    - Categoría: {service_category}
    - Valor estimado por el vendedor: {estimated_value}
    - Fecha: {end_date}
    - Urgencia de venta (1-10): 8
    
    ANÁLISIS DE DATOS HISTÓRICOS:
    {analysis}

    Tu objetivo es obtener el precio inicial para la subasta más optimo, para ello teniendo el analisis de datos historicos, tomando  
    category_segments debes centrarte en ejemplos con las categorias mas similares para elegir la recomendacion y tomando date_segments debes fijarte en
    las fechas mas similares(para buscar fechas similares debes tener en cuenta los siguientes puntos: Fin de semana o dia entre semana, laboral o festivo, 
    estación del año, mes del año), no solo tienes que fijarte en los valores de starting_bid, tambien en los de quantity que reflejan la cantidad que pago el
    ganador de la puja, si los valores de quantity son muy superiores porcentualmente a los de starting_bid da una recomendacion más alta para incitar pujas má altas. Sabiendo esto genera: 
    1. Una recomendación de starting_bid óptimo (valor numérico)
    2. Un rango recomendado (mínimo y máximo)

    responde unicamente con un JSON con el siguiente formato:
    
        "rango": str,
        "optimo": integer
    

    ejemplo:
    
    
        rango: "7-10",
        optimo: 9
    
    
    Tu recomendación debe balancear la atracción de postores con la maximización del precio final.
    """

   
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # o "gpt-4o-mini"
        messages=[
            {"role": "system", "content": template},
            {"role": "user", "content": "Dame una recomendacion de precio para mi subasta con los datos que tienes"},
        ],
        temperature=0.7,
    )
    
    raw_content = response.choices[0].message.content

    # 2. Limpiar el bloque ```json ... ```
    cleaned = raw_content.strip("`")  # quita los backticks
    cleaned = cleaned.replace("json", "", 1).strip()  # quita la palabra "json" si está al inicio

    recomendation = {}
    # 3. Parsear el contenido JSON
    try:
        recomendation = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print("Error al parsear JSON:", e)
    
    return recomendation


