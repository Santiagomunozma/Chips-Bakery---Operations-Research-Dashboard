Eres un Desarrollador Frontend Senior experto en React, Tailwind CSS, y visualización de datos. Tu tarea es construir un Dashboard interactivo (Single Page Application) que consolide un proyecto universitario de Investigación de Operaciones (Teoría de Decisiones y Teoría de Juegos) para el caso "Chips Bakery".

Stack Tecnológico Requerido:

Framework: React (Vite o Next.js App Router, elige el más rápido para este caso).

Estilos: Tailwind CSS (usa un diseño limpio, profesional, tipo panel de administración, con una paleta de colores basada en azules y grises oscuros).

Gráficos: Recharts (para el gráfico de líneas de sensibilidad).

Iconos: Lucide React.

Arquitectura y Vistas (Rutas/Tabs):
Crea un layout principal con un Sidebar de navegación fijo a la izquierda y un área de contenido dinámico. Las vistas son:

1. Inicio (Contexto Empresarial):

Extrae del documento adjunto (Mes.docx) la Misión, Visión y Objeto Social de la empresa.

Crea una tabla estilizada con los 10 meses de datos históricos y renderiza las fórmulas probabilísticas (30% Demanda Baja, 70% Demanda Alta) que justifican el problema.

2. Inferencia Bayesiana:

Una sección de texto que explique las alternativas de producción (d1=100, d2=250, d3=400 galletas).

Muestra un "Card" de resultados destacando el Beneficio Esperado sin estudio ($350k) vs con estudio ($482k), resaltando el IVEM ($132k).

Deja un 'placeholder' (div vacío con borde punteado) para que el usuario luego inserte una imagen SVG del árbol de decisión.

3. Análisis de Sensibilidad (Vista Interactiva Core):

Crea un control deslizante (input type="range") que controle una variable de estado en React llamada pBaja (de 0 a 100%).

Integra un gráfico de líneas multicapa usando Recharts. El eje X debe ser la probabilidad P (de 0 a 1) y el eje Y las ganancias monetarias.

Las líneas a graficar son las ecuaciones de las 3 alternativas:

d1: y = 200

d2: y = 500 - 750*p

d3: y = 800 - 1500*p

Haz que, al mover el slider, unos "Cards" superiores muestren el Valor Esperado calculado en tiempo real para las 3 opciones según la probabilidad elegida. Agrega una alerta visual que indique que en el 40% (0.4) la decisión óptima cambia de d3 a d1.

4. Teoría de Juegos (Minimax):

Crea dos sub-secciones o tabs: "Estrategia Pura (Punto de Silla)" y "Estrategia Mixta".

Extrae los datos de las matrices del documento Word sobre Gambit adjunto.

Renderiza las matrices de pagos utilizando tablas de Tailwind y resalta en verde claro la celda del Punto de Silla (200k).

Instrucciones adicionales:

Genera el código modular (componentes separados para el Sidebar, el Chart, y cada vista).

Usa diseño responsivo (mobile-first).

No dejes lógica matemática compleja a medias; las fórmulas de la vista 3 deben ser funcionales. Genera el código completo de una vez.