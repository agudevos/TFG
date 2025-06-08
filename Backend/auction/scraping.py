import requests
from bs4 import BeautifulSoup
from datetime import datetime

def obtener_programacion(plataformas, end_date):
    # URL de la guía de programación (puede cambiar)
    events = {}
    lista = [item.strip() for item in plataformas.split(",")]
    for plataforma in lista:
        if plataforma == "movistar+":
            url = f"https://www.movistarplus.es/programacion-tv/mplus/{end_date.date()}"
        elif plataforma == "eurosport":
            url = f"https://www.movistarplus.es/programacion-tv/esp/{end_date.date()}"
        elif plataforma == "dazn la liga":
            url = f"https://www.movistarplus.es/programacion-tv/daznli/{end_date.date()}"
        elif plataforma == "dazn f1":
            url = f"https://www.movistarplus.es/programacion-tv/mvf1/{end_date.date()}"
        
    
        # Hacer la solicitud HTTP
        response = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
        
        if response.status_code != 200:
            print(f"Error al acceder a la página: {response.status_code}")
            return None

        print("Documentales" in response.text)
        print(len(response.text))
        # Parsear el HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        
        # Aquí necesitarás identificar los elementos HTML específicos
        # que contienen la información de programación
        # (Esto requiere inspeccionar la estructura de la página)
        '''
        programacion = []
        # Ejemplo (los selectores exactos dependerán de la estructura real del sitio)
        elementos_programa = soup.select('a[data-testid=link-organism-schedule-card]')  # Ajusta este selector   
        print(len(elementos_programa))
        elementos_programa.extend(soup.select('div[data-testid=organism-schedule-card]'))
        print(len(elementos_programa))
        for elemento in elementos_programa:
            try:
                categoria = elemento.select_one(".mb-1.line-clamp-1.text-onLight-05.caps-s7-fx").text.strip() if soup.select_one(".mb-1.line-clamp-1.text-onLight-05.caps-s7-fx") else None
                titulo = elemento.select_one("h3.card-hover-underline.line-clamp-3.text-onLight-02.caps-s5-fx").text.strip() if soup.select_one("h3.card-hover-underline.line-clamp-3.text-onLight-02.caps-s5-fx") else None
                hora = elemento.select("p.line-clamp-1.text-onLight-04.caption-s5-fx.h-\\[17px\\]") if soup.select("p.line-clamp-1.text-onLight-04.caption-s5-fx.h-\\[17px\\]") else None
                programacion.append({
                    'fecha': datetime.now().strftime('%Y-%m-%d'),
                    'hora': hora[1].text.strip() if len(hora) > 1 else None,
                    'titulo': titulo,
                    'descripcion': categoria
                })
            except Exception as e:
                print(f"Error al procesar un elemento: {e}")
        
        return pd.DataFrame(programacion)
    '''

        programacion = {}
        # Ejemplo (los selectores exactos dependerán de la estructura real del sitio)
        elementos_programa = soup.select('.box') 
        for j in range(len(elementos_programa)):
            try:
                categoria = elementos_programa[j].select_one(".genre").get_text(strip=True) if elementos_programa[j].select_one(".genre") else None
                titulo = elementos_programa[j].select_one(".title").get_text(strip=True) if elementos_programa[j].select_one(".title") else None
                hora = elementos_programa[j].select_one(".time").get_text(strip=True) if elementos_programa[j].select_one(".time") else None
                data = {'fecha': datetime.now().strftime('%Y-%m-%d'), 'hora': hora, 'titulo': titulo, 'descripcion': categoria}

                programacion[j] = data
            except Exception as e:
                print(f"Error al procesar un elemento: {e}")
        first_key = next(iter(programacion))
        programacion.pop(first_key)
        last_key = list(programacion.keys())[-1] 
        programacion.pop(last_key)
        events[plataforma] = programacion

    
    return (events)