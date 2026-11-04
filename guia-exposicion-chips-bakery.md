# Guía de exposición — Chips Bakery

Dashboard de investigación de operaciones. Seis pestañas, un mismo negocio: decidir cuánto hornear, si conviene pagar un estudio de demanda, cómo reaccionar si la probabilidad de demanda baja cambia, cómo competir con otra galletería, cómo atender la fila del mostrador y cómo programar el lote para que salga a tiempo.

Esta guía está escrita para sustentarlo en voz alta. Los módulos 1, 2 y 3 quedan completos para que puedas responder si te preguntan. Los módulos 4, 5 y 6 (teoría de juegos, líneas de espera y análisis de ruta) están desarrollados como guion: qué decir, qué número mostrar y de dónde sale.

Abre la página en el caso base del laboratorio (precio 5, costo 3, producciones 100 / 250 / 400, demandas 100 y 400, P(baja) = 30 %). Los números de abajo son ese caso.

---

## Cómo está armada la página

El menú izquierdo tiene seis módulos:

1. Contexto empresarial
2. Inferencia bayesiana
3. Análisis de sensibilidad
4. Teoría de juegos
5. Líneas de espera
6. Análisis de ruta

Arriba, en las primeras tres pestañas, vive el **laboratorio**. Ahí se mueven el precio, el costo, las cantidades y las probabilidades. Esos controles reescriben la matriz de pagos, el valor esperado, Bayes y la sensibilidad. La pestaña de juegos, la de colas y la de rutas tienen sus propios datos: no dependen de ese laboratorio.

Hay dos problemas distintos en el dashboard y conviene decirlo al empezar:

- **Cuánto producir** (100, 250 o 400). Eso es contexto, Bayes y sensibilidad.
- **Cómo operar y cómo competir**: la campaña contra otra galletería (juegos), la fila del mostrador (colas) y el cronograma del lote (ruta).

Unidad de la matriz de producción: el modelo la muestra en **miles de dólares ($k)**. Precio 5 y costo 3, con cantidades 100, 250 y 400, dan los pagos 200, −250, 500, −700 y 800 que están en el Excel. En la tabla de los 10 meses el mismo cálculo aparece como dinero ($200, $500, −$250…). Es la misma cuenta; la matriz la lee en miles.

Fórmula de cada celda y de cada mes:

**Ganancia = precio × mín(producidas, demanda) − costo × producidas**

Si sobran galletas, se pagó el costo completo y no hay valor de salvamento. Si faltan, se deja de vender y no hay una multa extra en efectivo.

---

# Módulo 1. Contexto empresarial

## Qué problema se resuelve

Chips Bakery tiene que fijar la producción del próximo periodo **antes** de saber la demanda. Hay tres alternativas y dos estados:

| Alternativa | Qué significa |
| --- | --- |
| d1 | Producir 100 |
| d2 | Producir 250 |
| d3 | Producir 400 |
| S1 | Demanda baja: 100 |
| S2 | Demanda alta: 400 |

Precio de venta 5, costo unitario 3, margen 2.

## Matriz de pagos del caso base

| Alternativa | S1 baja (100) | S2 alta (400) | Valor esperado con P(S1) = 30 % |
| --- | --- | --- | --- |
| d1 producir 100 | $200k | $200k | **$200k** |
| d2 producir 250 | −$250k | $500k | **$275k** |
| d3 producir 400 | −$700k | $800k | **$350k** |

De dónde sale cada celda:

- d1 / S1: 5 × 100 − 3 × 100 = 200. En alta vende las mismas 100, así que d1 vale 200 en los dos estados. Es la alternativa segura.
- d2 / S1: 5 × 100 − 3 × 250 = 500 − 750 = −250. Sobran 150.
- d2 / S2: 5 × 250 − 3 × 250 = 500.
- d3 / S1: 5 × 100 − 3 × 400 = 500 − 1 200 = −700. Sobran 300.
- d3 / S2: 5 × 400 − 3 × 400 = 800.

Valor esperado de una fila:

**VE = P(S1) × pago en baja + P(S2) × pago en alta**

Con 30 % y 70 %:

- d1: 0,30 × 200 + 0,70 × 200 = 200
- d2: 0,30 × (−250) + 0,70 × 500 = −75 + 350 = 275
- d3: 0,30 × (−700) + 0,70 × 800 = −210 + 560 = 350

**La mejor decisión a priori es d3, producir 400, con VE = $350k.** La fila queda resaltada en la matriz.

## De dónde sale el 30 %

Hay 10 meses. Un mes es demanda baja si la demanda real es menor o igual que S1 (100). En el caso base son los meses 1, 4 y 6: 3 de 10 = 30 %. Los otros siete son demanda alta (250 o 400).

| Mes | Producción | Demanda | Vendidas | Sobrantes | Ganancia | Estado |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | 100 | 100 | 100 | 0 | 200 | Baja |
| 2 | 250 | 250 | 250 | 0 | 500 | Alta |
| 3 | 400 | 400 | 400 | 0 | 800 | Alta |
| 4 | 250 | 100 | 100 | 150 | −250 | Baja |
| 5 | 400 | 400 | 400 | 0 | 800 | Alta |
| 6 | 400 | 100 | 100 | 300 | −700 | Baja |
| 7 | 250 | 250 | 250 | 0 | 500 | Alta |
| 8 | 400 | 400 | 400 | 0 | 800 | Alta |
| 9 | 250 | 250 | 250 | 0 | 500 | Alta |
| 10 | 400 | 400 | 400 | 0 | 800 | Alta |

Si en la sustentación cambias la producción o la demanda de un mes, P(S1) se recalcula sola y se mueve todo el laboratorio.

## Identidad de la empresa (por si preguntan)

- **Misión.** Galletas artesanales de alta calidad, frescura y poco desperdicio.
- **Visión.** Al 2030, galletería líder en la región usando modelos analíticos, con operación sostenible.
- **Objetivo social.** Elaborar, transformar, empacar, distribuir y vender panadería y galletería, y gestionar la cadena de suministro.

## Frase para cerrar este módulo si te lo preguntan

“Con la historia de 10 meses la demanda baja pesa 30 %. Bajo esa probabilidad, producir 400 tiene el mayor valor esperado: 350 mil. Producir 100 nunca pierde, pero se queda en 200. Producir 250 queda en el medio, en 275.”

---

# Módulo 2. Inferencia bayesiana

Esta pestaña responde: **¿cuánto vale enterarse de la demanda antes de producir, y cuánto vale un estudio que a veces se equivoca?**

Usa la misma matriz. Los criterios de arriba no usan probabilidad. Los de abajo sí.

## Criterios sin probabilidad

**Optimista (maximax).** En cada fila se toma el mejor pago y se elige el mayor de esos mejores.

- d1: 200
- d2: 500
- d3: 800
- Decisión: **d3**, con 800. Apuesta al mejor escenario.

**Conservador (maximin).** En cada fila se toma el peor pago y se elige el menos malo.

- d1: mín(200, 200) = 200
- d2: mín(−250, 500) = −250
- d3: mín(−700, 800) = −700
- Decisión: **d1**, con 200. Es la única que no pierde.

**Arrepentimiento (minimax regret).** En cada estado se mira el mejor pago posible y se resta lo que realmente se obtuvo. Luego se elige la fila cuyo peor arrepentimiento sea el más pequeño.

Mejor pago en S1 = 200 (solo d1 gana en baja). Mejor pago en S2 = 800 (d3).

| | Arrepentimiento S1 | Arrepentimiento S2 | Peor de la fila |
| --- | ---: | ---: | ---: |
| d1 | 200 − 200 = 0 | 800 − 200 = 600 | 600 |
| d2 | 200 − (−250) = 450 | 800 − 500 = 300 | **450** |
| d3 | 200 − (−700) = 900 | 800 − 800 = 0 | 900 |

Decisión: **d2**, con arrepentimiento máximo de 450. d1 se arrepiente mucho si la demanda es alta. d3 se arrepiente mucho si es baja. d2 equilibra ese dolor.

Tres criterios, tres respuestas distintas: el optimista produce 400, el conservador produce 100 y el de arrepentimiento produce 250. Por eso hace falta la probabilidad.

## Datos del estudio (caso base)

El estudio de mercado dice “favorable” (F) o “desfavorable” (U). No es perfecto. En el Excel:

- P(F | S1) = 20 %. Si la demanda va a ser baja, el estudio acierta “desfavorable” el 80 % de las veces y se equivoca el 20 %.
- P(F | S2) = 80 %. Si la demanda va a ser alta, el estudio dice “favorable” el 80 %.
- P(U | S1) = 80 % y P(U | S2) = 20 %, porque son el complemento.

Priors: P(S1) = 30 %, P(S2) = 70 %.

## Probabilidad de cada informe

Ley de la probabilidad total:

**P(F) = P(S1)P(F|S1) + P(S2)P(F|S2) = 0,30 × 0,20 + 0,70 × 0,80 = 0,06 + 0,56 = 0,62**

**P(U) = 0,30 × 0,80 + 0,70 × 0,20 = 0,24 + 0,14 = 0,38**

## Teorema de Bayes (lo que de verdad creemos después del informe)

**P(S1 | F) = P(S1)P(F|S1) / P(F) = 0,06 / 0,62 = 3/31 ≈ 9,68 %**

**P(S2 | F) = 0,56 / 0,62 ≈ 90,32 %**

**P(S1 | U) = 0,24 / 0,38 = 12/19 ≈ 63,16 %**

**P(S2 | U) = 0,14 / 0,38 ≈ 36,84 %**

Lectura: un informe favorable casi descarta la demanda baja (baja de 30 % a 9,68 %). Un informe desfavorable la sube de 30 % a 63,16 %.

## Qué producir en cada rama

Con las probabilidades nuevas se recalcula el VE de d1, d2 y d3.

Si el estudio es **favorable** (P(S1) = 9,68 %):

- d1 = 200
- d2 ≈ 427
- d3 ≈ 655
- Se produce **d3**.

Si el estudio es **desfavorable** (P(S1) = 63,16 %):

- d1 = 200
- d2 ≈ 26
- d3 ≈ −147
- Se produce **d1**. El pesimismo del informe apaga la apuesta de 400.

## Los cuatro números de las tarjetas

**VE sin estudio = $350k.** Es el mejor VE a priori: d3. Si no se compra información, se produce 400.

**VEIP = $620k.** Valor esperado con información perfecta. Si se supiera el estado antes de producir, en baja se elegiría el mejor de esa columna (200) y en alta el mejor de esa columna (800):

VEIP = 0,30 × 200 + 0,70 × 800 = 60 + 560 = 620

El valor de la información perfecta es VEIP − VE = 620 − 350 = **$270k**. Ese es el techo: ningún estudio puede valer más que eso.

**VEOD = $482k.** Valor esperado con el estudio (información muestral). Se ponderan las dos ramas por la probabilidad del informe:

VEOD = P(F) × 655 + P(U) × 200 = 0,62 × (20 300/31) + 0,38 × 200 = 406 + 76 = 482

(655 es el redondeo de 20 300/31 ≈ 654,84.)

**IVEM = VEOD − VE = 482 − 350 = $132k.** Es lo máximo que se debería pagar por ese estudio. Si el proveedor cobra más de 132 mil, conviene producir 400 a ciegas.

**Eficiencia = IVEM / (VEIP − VE) = 132 / 270 ≈ 48,89 %.** El estudio recupera cerca de la mitad del valor de saber la demanda con certeza. La pestaña lo dice así: cerca del 49 % del beneficio de la información perfecta.

## Árbol (el de SilverDecisions, recalculado)

1. Nodo de decisión: ¿estudio?
2. Rama “no”: VE 350, decisión d3.
3. Rama “sí”: nodo de azar. Favorable 62 % → d3 con unos 655. Desfavorable 38 % → d1 con 200.
4. El valor de la rama “sí” es el VEOD, 482. Como 482 es mayor que 350, **conviene hacer el estudio si cuesta menos que 132**.

## Frase para este módulo

“Sin estudio producimos 400 y esperamos 350. Un estudio favorable nos deja en 400 con un valor cercano a 655; uno desfavorable nos baja a producir 100. El estudio vale 132 mil y captura el 49 % de lo que valdría conocer la demanda con certeza.”

---

# Módulo 3. Análisis de sensibilidad

Pregunta: **¿hasta qué probabilidad de demanda baja sigue conveniendo producir 400?**

El VE de cada alternativa es una recta en p = P(baja):

**VE(p) = pago en alta + p × (pago en baja − pago en alta)**

- d1: y = 200. Recta horizontal. Le da igual la probabilidad.
- d2: y = 500 − 750p
- d3: y = 800 − 1 500p

Se igualan d1 y d3:

200 = 800 − 1 500p → 1 500p = 600 → **p = 0,40**

d1 con d2 y d2 con d3 también se cruzan en 0,40. En el caso base las tres rectas se cortan en el mismo punto y ahí las tres valen 200.

Lectura del gráfico:

- Si P(baja) es **menor que 40 %**, gana d3. En el caso base, 30 %, VE de d3 = 350.
- Si P(baja) es **40 %**, las tres empatan en 200.
- Si P(baja) es **mayor que 40 %**, gana d1, que se queda en 200, mientras d2 y d3 caen.

El preset **“Baja afluencia (obras frente al local)”** pone P(baja) = 70 %. Entonces:

- d1 = 200
- d2 = 500 − 750 × 0,70 = −25
- d3 = 800 − 1 500 × 0,70 = −250

Con obras en la calle se produce 100. La pantalla avisa que el punto crítico quedó atrás y que la decisión deja de ser la más agresiva.

## Frase para este módulo

“Producir 400 solo es óptimo mientras la probabilidad de demanda baja esté por debajo del 40 %. En el histórico estamos en 30 %, así que se sostiene. Si las obras suben esa probabilidad a 70 %, la decisión salta a producir 100, que es la única que no entra en pérdida.”

---

# Módulo 4. Teoría de juegos — tu parte

## Qué estás modelando (dilo en la primera frase)

Esta pestaña **ya no es** la matriz de producir 100, 250 o 400. Esa decisión quedó en los tres módulos anteriores. Aquí Chips Bakery compite contra **otra galletería**. Las dos eligen una campaña y el pago es el **cambio de clientes de Chips**.

Estrategias de cada una: **Descuento, Combo y Obsequio**.

Es un juego de dos jugadores. Chips elige la fila. La competencia elige la columna. Un número positivo significa que Chips gana clientes frente a su base. Un número negativo significa que los pierde. La base de la simulación es 100 clientes para cada una.

## La matriz que hay que saberse

Pagos = cambio de clientes para Chips.

| Chips \ Competencia | Descuento | Combo | Obsequio |
| --- | ---: | ---: | ---: |
| Descuento | 10 | −20 | 30 |
| Combo | 20 | −10 | 40 |
| Obsequio | −5 | 40 | 60 |

Cómo leer tres celdas en voz alta:

- **Combo contra Descuento = 20.** Si Chips arma combo y la otra baja precios, Chips igual gana unos 20 clientes.
- **Descuento contra Combo = −20.** Si Chips solo descuenta y la otra arma combo, Chips pierde 20.
- **Obsequio contra Obsequio = 60.** Es el mejor pago de Chips, pero solo si la otra también se va por obsequio. La competencia no va a regalarle esa celda.

Esos 9 números son también el promedio de las pruebas: base 100 más el pago. Combo contra descuento da en promedio 120 clientes (100 + 20). Obsequio contra obsequio da 160 (100 + 60). Descuento contra combo da 80 (100 − 20).

## Paso 1. Dominancia, en el orden en que la calcula la página

Una fila domina a otra si le va mejor **en todas** las columnas y estrictamente mejor en alguna. Chips, que quiere el pago más alto, tira la fila dominada.

**Combo domina estrictamente a Descuento:**

- contra Descuento de la otra: 20 > 10
- contra Combo: −10 > −20
- contra Obsequio: 40 > 30

Descuento de Chips nunca es la mejor respuesta. Se elimina esa fila. Quedan Combo y Obsequio.

Ahora elige la competencia, que quiere **pagos más bajos para Chips**. Una columna domina a otra si en todas las filas que quedan es menor o igual, y en alguna es estrictamente menor.

Matriz que queda:

| Chips \ Competencia | Descuento | Combo | Obsequio |
| --- | ---: | ---: | ---: |
| Combo | 20 | −10 | 40 |
| Obsequio | −5 | 40 | 60 |

**La columna Descuento domina estrictamente a la columna Obsequio:**

- si Chips juega Combo: 20 < 40
- si Chips juega Obsequio: −5 < 60

Para la competencia, Obsequio es la peor columna: le entrega a Chips 40 o 60. Se elimina. (Combo de la competencia también le gana a Obsequio, celda a celda: −10 < 40 y 40 < 60. El algoritmo se queda con la primera dominancia estricta que encuentra, que es Descuento sobre Obsequio. El resultado residual es el mismo tipo de subjuego 2×2.)

## Paso 2. El subjuego que sí se mezcla

| Chips \ Competencia | Descuento | Combo |
| --- | ---: | ---: |
| Combo | a = 20 | b = −10 |
| Obsequio | c = −5 | d = 40 |

No hay punto de silla. Si Chips se clava en Combo, la competencia responde con Combo y Chips queda en −10. Si Chips se clava en Obsequio, la competencia responde con Descuento y Chips queda en −5. Cada uno tiene incentivo a no ser predecible.

La pantalla escribe la misma matriz **dividida entre 100** en el álgebra (0,20; −0,10; −0,05; 0,40). Las probabilidades no cambian. El valor que muestra la tarjeta está en clientes: **10,0000**.

## Paso 3. Mezcla de la competencia (indiferencia de Chips)

Chips queda indiferente cuando el pago esperado de Combo es igual al de Obsequio. Sea r la probabilidad de que la competencia juegue Descuento, y 1 − r la de que juegue Combo.

0,20 r + (−0,10)(1 − r) = (−0,05) r + 0,40(1 − r)

0,30 r − 0,10 = 0,40 − 0,45 r

0,75 r = 0,50

**r = 0,50 / 0,75 = 2/3 ≈ 66,67 % Descuento**

**1 − r = 33,33 % Combo**

Con esa mezcla, las dos filas de Chips valen lo mismo y Chips no puede castigar a la competencia cambiándose de fila.

Fórmula general, con la matriz en clientes:

**q\* = (d − b) / (a − b − c + d) = (40 − (−10)) / (20 − (−10) − (−5) + 40) = 50 / 75 = 2/3**

## Paso 4. Mezcla de Chips (indiferencia de la competencia)

Sea s la probabilidad de que Chips juegue Combo, y 1 − s la de Obsequio. Se igualan las dos columnas:

0,20 s + (−0,05)(1 − s) = (−0,10) s + 0,40(1 − s)

0,25 s − 0,05 = 0,40 − 0,50 s

0,75 s = 0,45

**s = 0,45 / 0,75 = 0,60**

**Chips: Combo 60 %, Obsequio 40 %. Descuento, 0 %.**

Fórmula:

**p\* = (d − c) / (a − c − b + d) = (40 − (−5)) / (20 − (−5) − (−10) + 40) = 45 / 75 = 0,60**

## Paso 5. Valor del juego

Cuando los dos mezclan así, el cambio esperado de clientes de Chips es:

v\* = 0,60 × 20 + 0,40 × (−5) = 12 − 2 = **10**

Comprobación por la mezcla de la competencia:

v\* = (2/3) × 20 + (1/3) × (−10) = 40/3 − 10/3 = 10

**Equilibrio: Chips espera ganar 10 clientes por campaña**, no los 60 de la celda soñada ni caer a −10. Las probabilidades son frecuencias de campaña a campaña. No son porcentajes de clientes dentro de una misma campaña. La pantalla lo advierte.

## La gráfica

Hay dos casos, que son las dos igualaciones de arriba, dibujadas como rectas. El eje horizontal es una probabilidad p. El eje vertical es el pago esperado en la escala dividida entre 100 (0,10 = 10 clientes).

**Caso 1.** Las dos rectas son las columnas, y p es la probabilidad de que Chips juegue Obsequio (p = 0 es Combo puro).

- Pago A (columna Descuento): 0,20 en p = 0 y −0,05 en p = 1
- Pago B (columna Combo): −0,10 en p = 0 y 0,40 en p = 1
- Se cruzan en p = 0,40. El pago del cruce es 0,10.
- Eso es Obsequio al 40 % y Combo al 60 %. El punto se etiqueta (q, p) = (60, 40).

**Caso 2.** Las dos rectas son las filas, y p es la probabilidad de que la competencia juegue Combo (p = 0 es Descuento puro).

- Pago A (fila Combo): 0,20 en p = 0 y −0,10 en p = 1
- Pago B (fila Obsequio): −0,05 en p = 0 y 0,40 en p = 1
- Se cruzan en p = 1/3 ≈ 0,333. El pago otra vez es 0,10.
- Descuento de la competencia al 66,67 % y Combo al 33,33 %. El punto se etiqueta cerca de (67, 33).

Si mueves un extremo, la pendiente y el cruce se recalculan. En la sustentación deja los valores por defecto: son los de la matriz.

## Las 90 pruebas de clientes

Hay 90 registros, 10 por cada una de las 9 combinaciones. Cada prueba anota clientes observados de las dos, un promedio estratégico y el cambio de ese promedio. La base de cada una es 100.

Promedio de **toda** la muestra (no es el equilibrio):

| Indicador | Valor |
| --- | ---: |
| Clientes observados de Chips | 118,3 |
| Clientes observados de la competencia | 81,7 |
| Promedio estratégico de Chips | 118,3 |
| Promedio estratégico de la competencia | 81,7 |
| Cambio promedio de Chips | +18,3 |

Ese +18,3 es el promedio de un muestreo parejo de las 9 celdas, incluidas las muy buenas para Chips (obsequio contra obsequio, +60). **El valor del juego, 10, es otra cosa:** es lo que queda cuando la competencia juega para no dejarse explotar. Si te preguntan por qué no coinciden, esa es la respuesta.

Promedios observados por combinación (coinciden con 100 + pago de la matriz):

| Chips | Competencia | Pruebas | Clientes Chips | Clientes competencia |
| --- | --- | ---: | ---: | ---: |
| Descuento | Descuento | 10 | 110 | 90 |
| Descuento | Combo | 10 | 80 | 120 |
| Descuento | Obsequio | 10 | 130 | 70 |
| Combo | Descuento | 10 | 120 | 80 |
| Combo | Combo | 10 | 90 | 110 |
| Combo | Obsequio | 10 | 140 | 60 |
| Obsequio | Descuento | 10 | 95 | 105 |
| Obsequio | Combo | 10 | 140 | 60 |
| Obsequio | Obsequio | 10 | 160 | 40 |

## Guion de 3 a 4 minutos (módulo 4)

> En teoría de juegos dejamos la decisión de cuántas galletas hornear y pasamos a la campaña. Chips y una competidora eligen descuento, combo u obsequio. El pago es el cambio de clientes de Chips.
>
> La matriz es 10, −20 y 30 en descuento; 20, −10 y 40 en combo; −5, 40 y 60 en obsequio. Combo le gana a Descuento en las tres columnas: 20 contra 10, −10 contra −20 y 40 contra 30. Descuento de Chips sale del juego.
>
> Sin esa fila, la columna Obsequio de la competencia queda dominada: le entrega a Chips 40 o 60, peor para ella que Descuento. Queda un 2 por 2: Combo y Obsequio contra Descuento y Combo. Ahí no hay estrategia pura, porque quien se deja ver pierde.
>
> Igualando pagos, Chips debe jugar Combo el 60 % de las campañas y Obsequio el 40 %. La competencia juega Descuento el 66,67 % y Combo el 33,33 %. El valor es 10 clientes. En la gráfica los dos cruces caen en un pago de 0,10, que es ese mismo 10 en la escala del dibujo.
>
> Las 90 pruebas promedian +18,3 porque recorren las nueve celdas por igual, incluida la de +60. Ese promedio no es el equilibrio. El equilibrio es lo que Chips puede sostener cuando la otra también juega bien.

## Preguntas que te pueden hacer en juegos

**¿Por qué se elimina Descuento de Chips?** Porque Combo le da un pago mayor en las tres columnas. Jugar Descuento no tiene ninguna columna en la que sea mejor.

**¿Por qué el valor es 10 y no 60?** Porque 60 solo ocurre si la competencia también elige Obsequio. En el equilibrio esa columna ya fue eliminada y, dentro del 2×2, la competencia mezcla para que Chips no pueda asegurar más de 10.

**¿60 % de qué?** De campañas. En 10 campañas, unas 6 de combo y 4 de obsequio, sin un orden fijo que la otra pueda aprender. No significa que el 60 % de los clientes reciba combo.

**¿Qué pasa si Chips se queda siempre en Combo?** La competencia responde siempre con Combo y el pago baja a −10. La mezcla existe para evitar eso.

**¿De dónde salen 0,20 y 0,40 en las ecuaciones?** Son los pagos de la matriz divididos entre 100. 20 clientes se escriben 0,20. El resultado en probabilidad es el mismo y el valor que reporta la tarjeta sigue siendo 10 clientes.

---

# Módulo 5. Líneas de espera — tu parte

## Qué problema se resuelve

La matriz de producción no dice nada de la fila del mostrador. Si los pedidos llegan más rápido, o más irregularmente, de lo que los canales pueden despachar, la gente espera, se va o se irrita. Abrir otro canal también cuesta. Esta pestaña pone números a ese equilibrio.

La pregunta de la pantalla:

> Con c canales iguales y una sola fila, ¿qué tan ocupado está cada canal, cuántas personas esperan en promedio, cuánto tiempo pasan en la fila y qué probabilidad hay de encontrar el sistema vacío o de tener que esperar?

No responde cuántas galletas hornear.

## El modelo: M/M/c

Notación de Kendall:

| Símbolo | En Chips Bakery |
| --- | --- |
| Primera M | Llegadas markovianas. El número de clientes por minuto es Poisson. El tiempo entre llegadas es exponencial. |
| Segunda M | El servicio también es markoviano: exponencial, con tasa μ **en cada canal**. |
| c | Canales idénticos. Una sola fila. Quien llega pasa al primer canal libre. |

Supuestos que acompañan ese nombre:

- La clientela posible se trata como infinita.
- La sala no tiene tope. Si los canales están ocupados, la persona espera.
- La disciplina es FIFO. No hay prioridades ni una fila por canal.
- Al terminar el servicio, el cliente sale.
- Los promedios son de **estado estable**: ya pasó el arranque del día y, en promedio, la llegada no supera la capacidad conjunta cμ.

Unidades: **clientes por minuto**. Con c = 1 el modelo es el de un solo empleado.

## De dónde salen λ y μ

Muestra de la ventanilla en el pico de la mañana, de 10:00 a 12:00, dos sábados (4 y 11 de octubre). Ocho franjas de 30 minutos: 240 minutos, 180 llegadas.

| Día | Franja | Llegadas |
| --- | --- | ---: |
| Sábado 4 oct | 10:00–10:30 | 22 |
| Sábado 4 oct | 10:30–11:00 | 24 |
| Sábado 4 oct | 11:00–11:30 | 21 |
| Sábado 4 oct | 11:30–12:00 | 23 |
| Sábado 11 oct | 10:00–10:30 | 20 |
| Sábado 11 oct | 10:30–11:00 | 25 |
| Sábado 11 oct | 11:00–11:30 | 23 |
| Sábado 11 oct | 11:30–12:00 | 22 |

**λ = 180 / 240 = 0,75 clientes por minuto**, es decir 45 por hora.

Se cronometraron 20 servicios: 0,4; 0,6; 0,8; 0,9; 1,0; 1,1; 1,2; 1,4; 0,7; 1,5; 0,5; 1,3; 0,8; 1,0; 1,6; 0,9; 1,1; 0,6; 1,2 y 1,4 minutos. La media es 1 minuto, así que **μ = 1 pedido por minuto en cada canal** (60 por hora). El tiempo medio de servicio es 1/μ = 1 minuto.

Con un solo mostrador esa afluencia dejaba una espera media de 3 minutos. Por eso se abrió un segundo canal igual de rápido. Por eso el caso de clase abre con **c = 2**.

Esos 20 tiempos y las ocho franjas no están listados en la pantalla. Están en **Exportar PDF**.

## Caso de clase: los números que tienes que decir de memoria

c = 2, λ = 0,75, μ = 1.

Capacidad conjunta cμ = 2. Como 0,75 < 2, el sistema se estabiliza.

Sea r = λ/μ = 0,75. Utilización **ρ = λ / (cμ) = 0,75 / 2 = 0,375**. Cada canal está ocupado el 37,5 % del tiempo.

| Medida | Valor | Qué decir |
| --- | ---: | --- |
| ρ | 0,375 | Cada canal ocupado el 37,5 % del tiempo |
| P0 | 0,4545 | El 45,5 % del tiempo no hay nadie en la ventanilla |
| Pw | 0,2045 | El 20,5 % de quienes llegan tienen que esperar |
| Lq | 0,1227 | En promedio hay 0,12 personas en la fila, sin contar a quien ya lo atienden |
| L | 0,8727 | En promedio hay 0,87 clientes en todo el sistema |
| Wq | 0,1636 min | Unos 10 segundos de espera antes de que empiece el pedido |
| W | 1,1636 min | Un poco más de un minuto desde que llega hasta que sale |
| P(N ≥ 5) | 0,0108 | Cerca de 1,1 % de probabilidad de encontrar 5 o más clientes en el sistema |

El dibujo redondea Lq: con 0,12 se ven cero puntos en la fila. λ/μ = 0,75 llena en parte el primer canal y deja el segundo libre. Eso es un promedio, no una foto de un minuto concreto.

## Desarrollo algebraico (por si piden la cuenta)

1. Suma de estados con canales libres, de n = 0 hasta c − 1:  r^0/0! + r^1/1! = 1 + 0,75 = 1,75.
2. Término de cola: r^c / (c! (1 − ρ)) = 0,5625 / (2 × 0,625) = 0,5625 / 1,25 = 0,45.
3. **P0 = 1 / (1,75 + 0,45) = 1 / 2,2 = 0,4545.**
4. **Pw = 0,45 × 0,4545 = 0,2045.** Es la probabilidad de que, al llegar, los dos canales ya estén ocupados.
5. **Lq = P0 × r^c × ρ / (c! (1 − ρ)^2) = (1/2,2) × 0,5625 × 0,375 / (2 × 0,625^2) = 0,1227.**
6. **L = Lq + λ/μ = 0,1227 + 0,75 = 0,8727.** λ/μ es el número medio de clientes en servicio.
7. **Wq = Lq / λ = 0,1227 / 0,75 = 0,1636 min.** Ley de Little: longitud media = tasa × tiempo medio.
8. **W = Wq + 1/μ = 0,1636 + 1 = 1,1636 min.**
9. **P(N ≥ 5) = 1 − (P0 + P1 + P2 + P3 + P4) ≈ 0,0108.**

Fórmulas de Pn:

- Si n ≤ c: Pn = P0 × r^n / n!
- Si n > c: Pn = P0 × r^n / (c! × c^(n−c))

Con n = 5, que es mayor que c = 2, se usa la segunda. El deslizador n deja ver tanto Pn como la cola P(N ≥ n).

Una hoja de clase redondea P0 antes de multiplicar y anota Lq = 0,1229. La pantalla usa 0,1227. Si te lo señalan, di que es el mismo desarrollo y que la diferencia es el redondeo intermedio.

## Un canal contra dos, con los mismos λ y μ

Con c = 1, ρ = λ/μ = 0,75 y, en un solo canal, Pw coincide con ρ.

- P0 = 1 − ρ = 0,25
- Lq = ρ² / (1 − ρ) = 0,5625 / 0,25 = 2,25
- L = λ / (μ − λ) = 0,75 / 0,25 = 3
- Wq = 3 minutos
- W = 4 minutos

La frase que ya arma la pantalla: con los mismos λ y μ, **un canal espera 3,00 min y dos canales esperan 0,16 min.** Ese salto es el argumento para el segundo mostrador.

## Las dos distribuciones de abajo

No cambian al pasar de un canal a varios.

**Poisson, llegadas en un minuto.** P(X = x) = λ^x × e^(−λ) / x!

Con λ = 0,75 y x = 0: P(nadie llega en ese minuto) = e^(−0,75) ≈ **0,472**.

**Exponencial, duración de un servicio.** P(T ≤ t) = 1 − e^(−μ t)

Con μ = 1:

- t = 0,5 → ≈ 0,393. Hay un 39 % de probabilidad de que el servicio dure medio minuto o menos.
- t = 1 → ≈ 0,632. Hay un 63 % de probabilidad de que dure un minuto o menos.

## Estabilidad

Hace falta **ρ < 1**, es decir **λ < cμ**. Si la llegada alcanza o supera la capacidad conjunta, la cola tiende a infinito y la pantalla deja en blanco P0, Lq, L, Wq, W y Pw. La barra de ρ se pone en rojo.

Qué hace cada deslizador:

- Subir λ alarga la fila y acerca ρ a 1.
- Subir μ acorta la fila y baja la ocupación de cada canal.
- Subir c reparte la misma llegada. El tope de la pantalla es 5 canales.

La pestaña no convierte la espera a pesos. Muestra el efecto en personas y minutos para que ese costo se compare aparte con el costo de otro colaborador.

## Mejora propuesta (está al final de la pestaña)

Además del segundo canal, se propone organizar el mostrador antes de abrir o en los valles de demanda:

- Galletas en bandejas identificadas por sabor.
- Bolsas y cajas al alcance del colaborador.
- Menú visible con precios y opciones.
- Una cantidad pequeña de las presentaciones más pedidas, ya lista.

El cliente mira las opciones mientras espera. Al llegar al mostrador, el colaborador confirma disponibilidad, cierra la elección y registra el pedido sin buscar producto ni repetir qué sabores quedan. En el modelo, eso empuja μ hacia arriba: el mismo canal atiende más rápido y bajan Wq y ρ.

## Guion de 3 a 4 minutos (módulo 5)

> Líneas de espera mira la ventanilla, no el horno. Medimos dos sábados de 10 a 12: 180 llegadas en 240 minutos, así que λ es 0,75 clientes por minuto. El servicio medio cronometrado es 1 minuto, así que μ es 1 por canal.
>
> Con un solo empleado la utilización es 0,75 y la espera media es 3 minutos. Por eso el caso de clase abre con dos canales iguales. La utilización de cada uno baja a 0,375. El sistema está vacío el 45 % del tiempo. Solo el 20 % de quienes llegan esperan. La fila promedio es 0,12 personas y la espera promedio es 0,16 minutos, unos 10 segundos. El cliente pasa en total 1,16 minutos. La probabilidad de encontrar 5 o más personas es de cerca del 1 %.
>
> Esos promedios son de estado estable. Describen el régimen cuando el día ya arrancó, no el primer minuto después de abrir. Si λ llegara a 2, que es la capacidad de los dos canales, la fila dejaría de tener promedio finito.
>
> La mejora de operación, además del segundo canal, es dejar el mostrador preparado: bandejas por sabor, empaques a la mano y menú visible, para que el servicio mismo sea más corto.

## Preguntas que te pueden hacer en colas

**¿Pw es lo mismo que ρ?** Con un canal, sí: quien llega espera exactamente cuando ese canal está ocupado. Con dos o más, hay que encontrar **todos** los canales ocupados. Por eso Pw = 0,20 es menor que ρ = 0,375.

**¿Lq y L?** Lq es solo la fila. L es fila más quien ya está siendo atendido. L = Lq + λ/μ.

**¿Wq y W?** Wq es la espera antes del servicio. W suma el servicio: W = Wq + 1/μ.

**¿Por qué con Lq = 0,12 el dibujo dice “nadie”?** Porque redondea el promedio a personas enteras. 0,12 está más cerca de 0 que de 1. El número fino está en la tarjeta: 0,1227.

**¿La Poisson y la exponencial dependen de c?** No. La Poisson describe cuántos entran en un minuto. La exponencial describe cuánto tarda un servicio en un canal. c entra en P0, Lq, Wq y Pw.

---

# Módulo 6. Análisis de ruta — tu parte

## Qué problema se resuelve

Aquí se programa **un lote de galletas**, de la receta hasta dejarlo en despacho. Hay 19 actividades, de la A a la S. Unas pueden ir en paralelo y otras esperan a que terminen sus predecesoras. La pregunta es cuánto dura el lote, qué actividades no se pueden retrasar, cómo cambia esa duración si los tiempos son inciertos (PERT) y cuánto cuesta acortar el cronograma (intercambio tiempo–costo).

La pestaña tiene cinco secciones: **CPM normal, Actualización PERT, Tiempo–costo, Probabilidad y Anexo metodológico.**

## Las 19 actividades y sus precedencias

Tiempos normales en minutos.

| Cód. | Actividad | Predecesoras | t |
| --- | --- | --- | ---: |
| A | Definir receta y cantidad del lote | Ninguna | 5 |
| B | Verificar disponibilidad de ingredientes | Ninguna | 6 |
| C | Limpiar y desinfectar estación | Ninguna | 8 |
| D | Alistar equipos y utensilios | C | 5 |
| E | Pesar ingredientes secos | A, B y C | 7 |
| F | Pesar ingredientes húmedos | A, B y C | 5 |
| G | Precalentar el horno | D | 12 |
| H | Mezclar ingredientes secos | E | 4 |
| I | Batir ingredientes húmedos | D y F | 5 |
| J | Integrar ingredientes y formar la masa | H e I | 7 |
| K | Reposar la masa | J | 10 |
| L | Preparar bandejas | D | 6 |
| M | Porcionar y moldear | K y L | 12 |
| N | Hornear | M y G | 15 |
| O | Enfriar | N | 12 |
| P | Inspeccionar calidad | O | 5 |
| Q | Empacar | P | 9 |
| R | Etiquetar | Q | 4 |
| S | Entregar el lote a despacho | R | 5 |

A, B y C arrancan juntas en el minuto 0. E no puede empezar hasta que terminan las tres. N no puede empezar hasta que la masa está porcionada **y** el horno está caliente.

## Cómo se calculan IP, TP, IL, TL y H

Recorrido hacia adelante:

- **IP** (inicio próximo) = el mayor TP de las predecesoras. Si no hay predecesoras, IP = 0.
- **TP** (terminación próxima) = IP + duración.

La duración del proyecto es el mayor TP. En el caso normal es el TP de S.

Recorrido hacia atrás:

- **TL** (terminación lejana) = el menor IL de las sucesoras. Si la actividad es terminal, TL = duración del proyecto.
- **IL** (inicio lejano) = TL − duración.
- **Holgura H** = IL − IP, que es lo mismo que TL − TP.

Holgura 0: la actividad es crítica. Si se atrasa un minuto, el lote sale un minuto más tarde. Holgura positiva: se puede atrasar ese número de minutos sin mover la entrega.

## Tiempos del CPM normal (sábetelos para la ruta crítica; el resto está en la tabla)

Duración del proyecto: **98 minutos**. Costo directo normal del lote: **$38.800 COP**. Es un supuesto académico, no una factura real.

| Cód. | t | IP | TP | IL | TL | H |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A | 5 | 0 | 5 | 3 | 8 | 3 |
| B | 6 | 0 | 6 | 2 | 8 | 2 |
| C | 8 | 0 | 8 | 0 | 8 | **0** |
| D | 5 | 8 | 13 | 9 | 14 | 1 |
| E | 7 | 8 | 15 | 8 | 15 | **0** |
| F | 5 | 8 | 13 | 9 | 14 | 1 |
| G | 12 | 13 | 25 | 36 | 48 | 23 |
| H | 4 | 15 | 19 | 15 | 19 | **0** |
| I | 5 | 13 | 18 | 14 | 19 | 1 |
| J | 7 | 19 | 26 | 19 | 26 | **0** |
| K | 10 | 26 | 36 | 26 | 36 | **0** |
| L | 6 | 13 | 19 | 30 | 36 | 17 |
| M | 12 | 36 | 48 | 36 | 48 | **0** |
| N | 15 | 48 | 63 | 48 | 63 | **0** |
| O | 12 | 63 | 75 | 63 | 75 | **0** |
| P | 5 | 75 | 80 | 75 | 80 | **0** |
| Q | 9 | 80 | 89 | 80 | 89 | **0** |
| R | 4 | 89 | 93 | 89 | 93 | **0** |
| S | 5 | 93 | 98 | 93 | 98 | **0** |

Ejemplo que puedes hacer en el tablero, actividad C:

- No tiene predecesoras, IP = 0, dura 8, TP = 8.
- E, que la sucede, tiene IP = 8. D y F también arrancan en 8. El IL de C queda en 0, así que H = 0. Limpiar la estación no tiene margen.

Ejemplo de holgura grande, actividad G (precalentar):

- IP = 13 (cuando termina D), TP = 25.
- N no la necesita hasta el minuto 48, porque porcionar termina en 48. TL de G = 48, IL = 36, **H = 23**. El horno puede esperar 23 minutos y el lote no se atrasa. El cuello de botella no es el precalentado: es la masa.

L, preparar bandejas, tiene holgura 17 por la misma razón: las bandejas están listas mucho antes de que termine el reposo.

## Las 9 rutas y por qué una es crítica

| Ruta | Secuencia | Minutos |
| --- | --- | ---: |
| 1 crítica | C → E → H → J → K → M → N → O → P → Q → R → S | **98** |
| 2 | C → D → I → J → K → M → N → O → P → Q → R → S | 97 |
| 3 | C → F → I → J → K → M → N → O → P → Q → R → S | 97 |
| 4 | B → E → H → J → K → M → N → O → P → Q → R → S | 96 |
| 5 | A → E → H → J → K → M → N → O → P → Q → R → S | 95 |
| 6 | B → F → I → J → K → M → N → O → P → Q → R → S | 95 |
| 7 | A → F → I → J → K → M → N → O → P → Q → R → S | 94 |
| 8 | C → D → L → M → N → O → P → Q → R → S | 81 |
| 9 | C → D → G → N → O → P → Q → R → S | 75 |

La duración mínima del proyecto es la de la ruta **más larga**. La ruta 1 suma 98 y es la única crítica en el programa normal. En la red se pinta de rojo.

Actividades críticas: **C, E, H, J, K, M, N, O, P, Q, R, S.**

En palabras: limpiar, pesar secos, mezclar secos, integrar, reposar, porcionar, hornear, enfriar, inspeccionar, empacar, etiquetar y entregar.

Las rutas 2 y 3 duran 97. Están a **un minuto** de volverse críticas. Si D, F o I se atrasan un minuto, aparece otra ruta crítica. El proyecto es sensible aunque solo una ruta tenga holgura cero.

A y B no son críticas: definir la receta tiene 3 minutos de holgura y verificar ingredientes tiene 2. C, que también arranca en cero, dura más (8) y sí es crítica. E tiene que esperar a la más lenta de A, B y C, y esa más lenta es C.

## PERT: cuando el tiempo no es un solo número

Cada actividad tiene tres estimaciones: a optimista, m más probable, b pesimista.

**Tiempo esperado tₑ = (a + 4m + b) / 6**

**Varianza σ² = ((b − a) / 6)²**

El 4m le da más peso al valor más probable. La varianza crece cuando el optimista y el pesimista están lejos.

| Cód. | a | m | b | tₑ | σ² |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | 4 | 5 | 8 | 5,3333 | 0,4444 |
| B | 4 | 6 | 9 | 6,1667 | 0,6944 |
| C | 6 | 8 | 11 | 8,1667 | 0,6944 |
| D | 4 | 5 | 7 | 5,1667 | 0,2500 |
| E | 5 | 7 | 10 | 7,1667 | 0,6944 |
| F | 4 | 5 | 8 | 5,3333 | 0,4444 |
| G | 10 | 12 | 16 | 12,3333 | 1,0000 |
| H | 3 | 4 | 6 | 4,1667 | 0,2500 |
| I | 4 | 5 | 7 | 5,1667 | 0,2500 |
| J | 6 | 7 | 10 | 7,3333 | 0,4444 |
| K | 9 | 10 | 13 | 10,3333 | 0,4444 |
| L | 4 | 6 | 8 | 6,0000 | 0,4444 |
| M | 10 | 12 | 16 | 12,3333 | 1,0000 |
| N | 14 | 15 | 19 | 15,5000 | 0,6944 |
| O | 10 | 12 | 15 | 12,1667 | 0,6944 |
| P | 4 | 5 | 7 | 5,1667 | 0,2500 |
| Q | 7 | 9 | 12 | 9,1667 | 0,6944 |
| R | 3 | 4 | 6 | 4,1667 | 0,2500 |
| S | 4 | 5 | 7 | 5,1667 | 0,2500 |

Esos tₑ reemplazan a los tiempos fijos y la red se recalcula. La ruta crítica **sigue siendo la 1** (C, E, H, J, K, M, N, O, P, Q, R, S). Su duración esperada es:

**μ = 100,83 minutos**

(8,1667 + 7,1667 + 4,1667 + 7,3333 + 10,3333 + 12,3333 + 15,5000 + 12,1667 + 5,1667 + 9,1667 + 4,1667 + 5,1667 = 100,8333.)

La ruta 3 queda en 100,00 y la 2 en 99,83. Siguen pegadas a la crítica. Conviene decirlo: la holgura de un minuto del CPM casi desaparece cuando se usan tiempos esperados.

**Varianza de la ruta crítica** = suma de las varianzas de esas 12 actividades = **6,3611 min²**.

**Desviación estándar σ = √6,3611 = 2,52 minutos.**

No se suman las varianzas de las 19. Solo las de la ruta que manda la duración. El supuesto es que las duraciones son independientes.

## Probabilidad de cumplir un plazo

Se aproxima la duración del proyecto con una normal de media μ = 100,83 y desviación 2,52.

**Z = (plazo − μ) / σ**

**P(T ≤ plazo) = Φ(Z)**

La pantalla abre con plazo **105 minutos**:

Z = (105 − 100,8333) / 2,5221 ≈ **1,65**

**P(cumplir 105 min) ≈ 95,05 %**

La probabilidad de pasarse de 105 es el complemento, cerca de 4,95 %. El área rosa de la gráfica es el cumplimiento; la gris, quedar por fuera; la curva ámbar es la normal.

Eso es una aproximación académica. No es una garantía de producción: asume independencia y se apoya en una sola ruta crítica, aunque las rutas 2 y 3 están muy cerca. Si el profesor mueve el plazo, Z y el porcentaje se recalculan. Un plazo por debajo de 100,83 da Z negativo y una probabilidad menor que 50 %.

## Tiempo–costo: cómo se acorta el lote y cuánto cuesta

Para cada actividad:

- Tn = tiempo normal, Cn = costo normal
- Tc = tiempo mínimo si se le meten recursos, Cc = costo de ese mínimo
- TR = Tn − Tc, el máximo de minutos que se puede recortar
- **Pendiente S = (Cc − Cn) / (Tn − Tc)**, pesos por minuto recortado

Si Tn = Tc, no se puede acelerar y la pendiente no existe.

| Cód. | Tn | Cn | Tc | Cc | TR | S (COP por min) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| A | 5 | 1.200 | 5 | 1.200 | 0 | — |
| B | 6 | 1.800 | 6 | 1.800 | 0 | — |
| C | 8 | 2.500 | 7 | 3.300 | 1 | 800 |
| D | 5 | 1.300 | 5 | 1.300 | 0 | — |
| E | 7 | 2.100 | 6 | 2.700 | 1 | 600 |
| F | 5 | 1.500 | 5 | 1.500 | 0 | — |
| G | 12 | 2.400 | 12 | 2.400 | 0 | — |
| H | 4 | 1.400 | 3 | 1.900 | 1 | 500 |
| I | 5 | 1.800 | 5 | 1.800 | 0 | — |
| J | 7 | 2.600 | 6 | 3.300 | 1 | 700 |
| K | 10 | 1.200 | 10 | 1.200 | 0 | — |
| L | 6 | 1.500 | 5 | 2.000 | 1 | 500 |
| M | 12 | 4.300 | 10 | 6.100 | 2 | 900 |
| N | 15 | 5.500 | 15 | 5.500 | 0 | — |
| O | 12 | 1.000 | 12 | 1.000 | 0 | — |
| P | 5 | 1.300 | 4 | 1.800 | 1 | 500 |
| Q | 9 | 3.300 | 7 | 4.700 | 2 | 700 |
| R | 4 | 900 | 3 | 1.300 | 1 | 400 |
| S | 5 | 1.200 | 4 | 1.600 | 1 | 400 |

Regla: solo vale la pena pagar por recortar una actividad **crítica**. Recortar G o L, que tienen holgura, gasta plata y el lote sigue durando 98. Entre las críticas, se recorta primero la de **menor pendiente**.

En la ruta 1, las que sí se pueden recortar y sus pendientes son: S 400, R 400, P 500, H 500, E 600, J 700, Q 700, C 800, M 900. K, N y O son críticas pero no tienen recorte posible: el reposo, el horno y el enfriado se quedan en su tiempo.

Orden en que la página arma los programas, un minuto a la vez:

1. S de 5 a 4, porque cuesta 400 y está en la ruta crítica. El proyecto pasa de 98 a 97. Costo 39.200.
2. R de 4 a 3, otros 400. Proyecto 96. Costo 39.600.
3. P de 5 a 4, pendiente 500. Proyecto 95. Costo 40.100.
4. H de 4 a 3, pendiente 500. H solo está en la ruta 1. Al bajarla, la ruta 1 llega a 94 y **empata** con las rutas 2 y 3. Desde ahí hay tres rutas críticas. Costo 40.600.

A partir de 94 minutos, recortar una actividad que solo está en una de las tres rutas no acorta el proyecto. Hay que recortar algo común a las tres. E, aunque su pendiente es 600 y parece barata, solo está en la ruta 1: recortarla dejaría las rutas 2 y 3 en 94. Por eso no entra en el programa.

Lo común y acelerable, de más barato a más caro: Q y J a 700, C a 800, M a 900.

5. Q de 9 a 8. Proyecto 93. Costo 41.300. Siguen críticas las rutas 1, 2 y 3.
6. Q de 8 a 7. Se agota su TR de 2 minutos. Proyecto 92. Costo 42.000.
7. J de 7 a 6. Proyecto 91. Costo 42.700.
8. C de 8 a 7. Proyecto 90. Costo 43.500.
9. M de 12 a 11. Proyecto 89. Costo 44.400.
10. M de 11 a 10. Se agota M. Proyecto **88**. Costo **45.300**.

Los botones de la pantalla muestran los programas de 98, 97, 94, 93, 90 y 88 minutos, que son los quiebres: el normal, el primer recorte, el momento en que aparecen tres rutas críticas, y los saltos siguientes hasta el mínimo propuesto.

| Prog. | Tiempo | Costo directo | Qué se acaba de hacer |
| ---: | ---: | ---: | --- |
| 1 | 98 | 38.800 | Nada |
| 2 | 97 | 39.200 | S (5→4) |
| 3 | 96 | 39.600 | R (4→3) |
| 4 | 95 | 40.100 | P (5→4) |
| 5 | 94 | 40.600 | H (4→3). Críticas: rutas 1, 2 y 3 |
| 6 | 93 | 41.300 | Q (9→8) |
| 7 | 92 | 42.000 | Q (8→7) |
| 8 | 91 | 42.700 | J (7→6) |
| 9 | 90 | 43.500 | C (8→7) |
| 10 | 89 | 44.400 | M (12→11) |
| 11 | 88 | 45.300 | M (11→10) |

Bajar el lote de 98 a 88 minutos cuesta 45.300 − 38.800 = **6.500 COP** en costo directo adicional. 10 minutos, 650 COP por minuto en promedio, pero no es uniforme: los primeros minutos cuestan 400 y los últimos cuestan 900.

Al elegir un programa, la red se vuelve a dibujar con las duraciones ya recortadas y con las rutas críticas de ese escenario. En 98 minutos la crítica es una. Desde 94, son tres.

## Guion de 4 minutos (módulo 6)

> Análisis de ruta programa el lote, de la receta hasta despacho: 19 actividades. Unas arrancan juntas y otras esperan. El CPM con tiempos fijos da una duración de 98 minutos y un costo directo normal de 38.800 pesos.
>
> La ruta crítica es C, E, H, J, K, M, N, O, P, Q, R y S: limpiar, pesar y mezclar secos, integrar, reposar, porcionar, hornear, enfriar, inspeccionar, empacar, etiquetar y entregar. Esas actividades tienen holgura cero. Precalentar el horno tiene 23 minutos de holgura y preparar bandejas tiene 17: no son el cuello de botella. Las dos rutas que siguen duran 97. Un atraso de un minuto en alistar equipos, pesar húmedos o batir crea una segunda ruta crítica.
>
> Con PERT cada actividad tiene optimista, más probable y pesimista. El tiempo esperado es (a + 4m + b) / 6. La misma ruta sigue siendo crítica, pero la duración esperada sube a 100,83 minutos, con desviación 2,52. Para un plazo de 105 minutos, Z es 1,65 y la probabilidad de cumplir es 95 %.
>
> Si hay que entregar antes, se pagan recursos en la actividad crítica más barata de acelerar. Etiquetar y entregar cuestan 400 pesos por minuto. Así se baja de 98 a 96. Al llegar a 94 minutos aparecen tres rutas críticas y solo sirve recortar lo que las tres comparten. El programa más corto de la página es 88 minutos a 45.300 pesos.

## Preguntas que te pueden hacer en ruta

**¿Por qué la ruta crítica es la más larga y no la más corta?** Porque el lote no se entrega cuando termina el camino rápido. Se entrega cuando termina el último camino. El horno puede estar listo en la ruta 9 a los 75 minutos y aun así hay que esperar la masa, que viene por la ruta de 98.

**¿Holgura cero significa que la actividad es la más larga?** No. Significa que no tiene margen respecto al proyecto. R dura 4 minutos y es crítica. G dura 12 y no lo es.

**¿Por qué E no se acelera si su pendiente es 600, menor que la de Q?** Porque cuando el proyecto llega a 94 minutos, E solo está en una de las tres rutas críticas. Acortarla no mueve las otras dos y la entrega sigue en 94. Q, J, C y M sí están en las tres.

**¿Por qué no se acelera el horneado, que dura 15?** Porque en los datos su tiempo crash es igual al normal. No hay recorte propuesto. Lo mismo pasa con el reposo y el enfriado.

**¿La probabilidad de 95 % garantiza el lote?** No. Es Φ(Z) bajo una normal, sumando varianzas de la ruta crítica y suponiendo independencia. Las rutas 2 y 3 están a menos de un minuto en PERT. El anexo de la página lo dice: hay que validar tiempos y costos con datos reales antes de decidir.

**¿IP y TP contra IL y TL?** IP y TP son lo más pronto que puede ocurrir, mirando hacia adelante. IL y TL son lo más tarde que puede ocurrir sin atrasar la entrega, mirando hacia atrás. La diferencia es la holgura.

---

# Guion continuo, por si presentas los tres seguidos (unos 10 minutos)

1. **Puente (20 segundos).** “Los tres primeros módulos deciden cuántas galletas hornear. Yo sigo con lo que pasa alrededor de esa decisión: la campaña contra la competencia, la fila del mostrador y el cronograma del lote.”

2. **Juegos.** Matriz 3×3, Combo domina a Descuento, se cae Obsequio de la competencia, mezcla 60/40 contra 67/33, valor de 10 clientes. Las 90 pruebas promedian 18 y eso no es el equilibrio.

3. **Colas.** λ = 0,75 por la muestra de 180 en 240. μ = 1. Un canal espera 3 minutos; dos canales esperan 0,16. ρ = 0,375, P0 = 0,45, Pw = 0,20. Cierra con la mejora del mostrador.

4. **Ruta.** 98 minutos, ruta C–E–H–J–K–M–N–O–P–Q–R–S, holgura grande en el horno y en las bandejas, PERT en 100,83 con 95 % de cumplir 105, y crash hasta 88 minutos a 45.300 pesos.

5. **Cierre (20 segundos).** “Producir 400 conviene si la demanda baja pesa menos del 40 %. Competir conviene en una mezcla de combo y obsequio que asegura unos 10 clientes. Atender conviene con dos canales. Y el lote sale en 98 minutos si no se toca la ruta crítica; si se toca, se paga desde la actividad más barata de acelerar.”

---

# Números para llevar en una tarjeta

**Producción.** d3, VE $350k. Cruce de sensibilidad en 40 %. Con obras (70 %) se pasa a d1. IVEM $132k. Eficiencia del estudio 48,9 %.

**Juegos.** Combo 60 %, Obsequio 40 %. Competencia: Descuento 66,67 %, Combo 33,33 %. Valor: +10 clientes.

**Colas.** λ 0,75, μ 1, c 2. ρ 0,375. P0 0,4545. Pw 0,2045. Lq 0,1227. Wq 0,1636 min. Un canal: Wq 3 min.

**Ruta.** CPM 98 min, $38.800. Crítica: C E H J K M N O P Q R S. PERT 100,83 min, σ 2,52, P(T ≤ 105) ≈ 95 %. Crash mínimo: 88 min, $45.300.
