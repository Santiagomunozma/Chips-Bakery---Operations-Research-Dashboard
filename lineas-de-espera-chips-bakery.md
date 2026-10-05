# Líneas de espera en Chips Bakery

Documento de apoyo para la pestaña **Líneas de espera** del dashboard. Explica qué problema se está resolviendo, qué sistema se modela y qué significa cada número que aparece en pantalla.

---

## 1. Qué problema se busca resolver

Chips Bakery no solo decide cuántas galletas hornear. También tiene que atender a quien llega al mostrador. Si los pedidos llegan más rápido, o de forma más irregular, de lo que el empleado puede despacharlos, se forma una fila.

Esa fila tiene un costo aunque no salga en la matriz de producción: el cliente espera, se impacienta o se va. Atender más rápido también tiene un costo: más personal, más ritmo, más capacidad. El estudio de la cola sirve para ver ese equilibrio con números, no con una impresión.

La pregunta concreta de esta pestaña es:

> Con un solo empleado en la ventanilla, ¿qué tan ocupado está, cuántas personas esperan en promedio, cuánto tiempo pasan en la fila y qué probabilidad hay de encontrar el sistema vacío, lleno o de tener que esperar?

No responde cuántas galletas producir (100, 250 o 400). Eso sigue en contexto, sensibilidad, Bayes y teoría de juegos. Aquí el objeto es la **ventanilla de pedidos**.

---

## 2. Qué sistema se está modelando

Se usa un modelo clásico de teoría de colas llamado **M/M/1**. La notación de Kendall se lee así:

| Letra | Significado en Chips Bakery |
| --- | --- |
| Primera **M** | Las llegadas son markovianas: el número de clientes que entra en un minuto sigue una distribución de Poisson. El tiempo entre una llegada y la siguiente es exponencial. |
| Segunda **M** | El tiempo de servicio también es markoviano: exponencial, con una tasa media μ. |
| **1** | Hay un solo servidor. Un empleado atiende un pedido a la vez. |

Supuestos que acompañan a ese nombre:

- **Población.** La clientela posible se trata como infinita. No se modela un grupo cerrado de 10 personas.
- **Cola.** Si el empleado está ocupado, quien llega espera. La sala no tiene tope: la capacidad de la fila es infinita.
- **Disciplina.** FIFO (el primero que llega es el primero que se atiende). No hay prioridades ni atención por lotes.
- **Salida.** Al terminar el servicio, el cliente sale del sistema.
- **Estado estable.** Los promedios de abajo valen cuando el sistema ya pasó el arranque del día (el periodo transitorio) y la llegada no supera, en promedio, a la capacidad de servicio.

Unidades de trabajo: **clientes (o pedidos) por minuto**.

---

## 3. El caso de clase que abre la pestaña

Al entrar, los deslizadores están en el ejemplo numérico de la clase:

- Llegan, en promedio, **45 clientes por hora**. Por minuto eso es λ = 45 / 60 = **0.75**.
- El empleado puede procesar **60 pedidos por hora**. Por minuto eso es μ = 60 / 60 = **1**.

Con esas tasas el sistema sí se estabiliza, porque 0.75 es menor que 1. Los resultados que deben verse son:

| Medida | Valor | Lectura en la panadería |
| --- | --- | --- |
| ρ | 0.75 | El empleado está ocupado el 75 % del tiempo. |
| P0 | 0.25 | El 25 % del tiempo no hay nadie en la ventanilla. |
| Lq | 2.25 | En promedio hay 2.25 clientes esperando, sin contar al que está siendo atendido. |
| L | 3 | En promedio hay 3 clientes en todo el sistema (fila + mostrador). |
| Wq | 3 min | Quien llega espera, en promedio, 3 minutos antes de que empiece su pedido. |
| W | 4 min | En total pasa 4 minutos desde que llega hasta que sale (3 de espera + 1 de servicio). |
| Pw | 0.75 | El 75 % de los que llegan tienen que esperar. Coincide con ρ en este modelo de un servidor. |
| P3 | ≈ 0.105 | Hay cerca de un 10.5 % de probabilidad de encontrar exactamente 3 clientes en el sistema. |
| P(T ≤ 0.5) | ≈ 0.393 | Casi un 39 % de los servicios duran medio minuto o menos. |
| P(T ≤ 1) | ≈ 0.632 | Casi un 63 % de los servicios duran un minuto o menos. |
| P(X = 0) | ≈ 0.472 | En un minuto cualquiera, hay cerca de un 47 % de probabilidad de que no llegue nadie. |

Si se mueven λ o μ, las tarjetas se recalculan. El caso de clase es solo el punto de partida.

---

## 4. Qué significa cada símbolo

### λ (lambda): tasa de llegada

Cuántos clientes entran **en promedio** por minuto. No es un horario fijo. A veces llegan dos juntos y a veces pasa un minuto vacío. λ = 0.75 no significa “cada minuto llega 0.75 de persona”: significa que, a la larga, entran 0.75 personas por minuto, es decir 45 por hora.

En la pantalla, el deslizador muestra las dos escalas: por minuto y por hora (λ × 60).

### μ (mu): tasa de servicio

Cuántos pedidos puede completar el empleado **en promedio** por minuto, si está ocupado todo el tiempo. μ = 1 significa 60 pedidos por hora, o un servicio medio de 1 / μ = **1 minuto** por cliente.

μ no es el tiempo. El tiempo medio de servicio es 1/μ.

### ρ (rho): utilización

ρ = λ / μ.

Es la fracción del tiempo en que el servidor está ocupado. Con λ = 0.75 y μ = 1, ρ = 0.75: ocupado tres cuartas partes del tiempo y libre la cuarta parte.

También es la probabilidad de que un cliente que llega tenga que esperar (Pw), cuando hay un solo servidor y la cola es infinita.

La barra de la pestaña es esa fracción. Si ρ se acerca a 1, una subida pequeña de llegadas alarga mucho la espera. Si ρ ≥ 1, la barra llega al tope y el sistema deja de tener promedios finitos.

### Condición de estabilidad

Para que la fila no crezca sin límite hace falta

ρ < 1, es decir λ < μ.

Si llegan más clientes por minuto de los que el empleado puede atender, la cola tiende a infinito. En ese caso la pestaña deja en blanco P0, Lq, L, Wq, W y Pw, y avisa que no hay estado estable. La probabilidad de Poisson de las llegadas y la del tiempo de servicio siguen teniendo sentido, porque no dependen de que la fila esté estable.

---

## 5. Medidas de desempeño

Todas son **promedios o probabilidades de estado estable**, no una foto de un minuto concreto.

### P0: probabilidad de que el sistema esté vacío

P0 = 1 − λ / μ = 1 − ρ.

Es la probabilidad de llegar y encontrar al empleado libre y la fila vacía. En el caso de clase, 0.25.

### Lq: número promedio en la línea de espera

Lq = λ² / [ μ (μ − λ) ].

Cuenta solo a quienes **esperan**. No incluye a quien ya está en el mostrador. En el caso de clase, 2.25 personas.

Los puntos de color de la pestaña redondean ese promedio para que se vea la fila. Con 2.25 se dibujan 2 puntos. Si la fila media pasa de 16, se muestran 16 y el resto como “+”.

### L: número promedio en el sistema

L = Lq + λ / μ.

Es la fila más quien está siendo atendido. λ/μ es el número medio de clientes en servicio (en M/M/1 no puede pasar de 1 en el promedio, y coincide con ρ). En el caso de clase: 2.25 + 0.75 = 3.

### Wq: tiempo promedio en la línea

Wq = Lq / λ.

Minutos que un cliente pasa **esperando** antes de que empiece su servicio. En el caso de clase, 2.25 / 0.75 = 3 minutos.

Esta relación (longitud media = tasa × tiempo medio) es la ley de Little.

### W: tiempo promedio en el sistema

W = Wq + 1/μ.

Espera más servicio. En el caso de clase, 3 + 1 = 4 minutos. Ese es el tiempo desde que entra hasta que se va con el pedido.

### Pw: probabilidad de esperar

Pw = λ / μ = ρ.

Probabilidad de que, al llegar, el empleado ya esté ocupado y haya que hacer fila. En el caso de clase, 0.75. No es lo mismo que Wq: uno es una probabilidad y el otro es un tiempo.

### Pn: probabilidad de n clientes en el sistema

Pn = (λ / μ)^n × P0.

“En el sistema” incluye fila y servicio. El deslizador **n** elige ese número. Con n = 0 se recupera P0. Con n = 3 y los datos de clase:

Pn = (0.75)³ × 0.25 ≈ 0.105.

Sirve para preguntas del tipo “¿qué tan probable es encontrar exactamente 3 personas adentro?”.

---

## 6. Las dos distribuciones de la parte de abajo

### Llegadas: Poisson

P(X = x) = λ^x × e^(−λ) / x!.

X es cuántos clientes entran **durante un minuto**. Cada llegada es aleatoria e independiente de las demás; no se puede anunciar de antemano.

El deslizador **x** elige ese conteo.

- x = 0 responde: “¿qué probabilidad hay de que en este minuto no llegue nadie?”. Con λ = 0.75, cerca de 0.472.
- x = 1, 2, 3… responde la probabilidad de exactamente esa cantidad de llegadas en el minuto.

### Servicio: exponencial

P(T ≤ t) = 1 − e^(−μ t).

T es cuánto dura el servicio de un cliente, contado desde que el empleado empieza hasta que el cliente recibe el pedido. No es constante: cambia de un cliente al siguiente. La exponencial concentra más probabilidad en servicios cortos y deja una cola de servicios largos.

El deslizador **t** está en minutos. Los botones de la clase fijan los dos cálculos del ejemplo, con μ = 1:

- t = 0.5 → 1 − e^(−0.5) ≈ 0.393. Cerca del 39 % de los pedidos se despachan en medio minuto o menos.
- t = 1 → 1 − e^(−1) ≈ 0.632. Cerca del 63 % se despachan en un minuto o menos.

e es el número de Euler (aproximadamente 2.718).

---

## 7. Cómo leer la fila dibujada

Hay dos grupos de puntos:

- **En espera.** Un punto por cada cliente del promedio Lq, redondeado. Con el caso de clase se ven 2 puntos, aunque el promedio exacto es 2.25.
- **En servicio.** Un punto verde si el servidor está ocupado en el promedio (ρ mayor que 0.05). Representa al cliente que está en el mostrador, no a 0.75 personas.

Si λ ≥ μ, no hay largo estable: la pantalla lo dice y no inventa una fila finita.

---

## 8. Para qué sirve mover los deslizadores

El objetivo del estudio, en la clase, es equilibrar dos costos que se mueven en sentido contrario:

- **Costo de servicio.** Sube si se atiende más rápido o si se pone más personal.
- **Costo de espera.** Baja cuando la fila y el tiempo de espera bajan. Sube cuando el cliente espera demasiado.

Con pocos servidores se gasta poco en atención y mucho en espera. Con muchos, al revés. El costo total suele tener un mínimo en un punto intermedio.

Esta pestaña **no calcula ese costo en dólares** y **no resuelve varios servidores (M/M/c)**, porque la clase solo deja las fórmulas de un servidor. Lo que sí permite es ver el efecto de la capacidad de ese único empleado:

- Subir λ (más afluencia) alarga Lq y Wq, y acerca ρ a 1.
- Subir μ (el empleado atiende más rápido) acorta la fila y el tiempo, y baja la ocupación.
- Si λ alcanza o pasa a μ, el modelo avisa que la ventanilla no da abasto.

---

## 9. Qué no está haciendo esta pestaña

- No usa el precio, el costo ni la demanda de 100, 250 o 400 galletas. Cambiar el laboratorio de producción no mueve λ ni μ.
- No dice cuánto producir mañana.
- No reparte la fila entre varios cajeros.
- No asigna un costo monetario a cada minuto de espera.
- Los promedios no describen la primera media hora del día, mientras la fila todavía se está formando. Describen el régimen de estado estable.

El botón **Caso base** del laboratorio sí devuelve λ, μ, n, x y t a los valores de la clase (0.75, 1, 3, 0 y 1).

---

## 10. Sustitución del caso de clase, paso a paso

Datos: λ = 0.75, μ = 1.

1. ρ = 0.75 / 1 = 0.75. Como es menor que 1, se pueden calcular los promedios.
2. P0 = 1 − 0.75 = 0.25.
3. Lq = (0.75)² / [1 × (1 − 0.75)] = 0.5625 / 0.25 = 2.25.
4. L = 2.25 + 0.75 = 3.
5. Wq = 2.25 / 0.75 = 3 minutos.
6. W = 3 + 1/1 = 4 minutos.
7. Pw = 0.75.
8. P3 = (0.75)³ × 0.25 = 0.421875 × 0.25 ≈ 0.105.
9. P(T ≤ 0.5) = 1 − e^(−1 × 0.5) ≈ 0.393.
10. P(T ≤ 1) = 1 − e^(−1 × 1) ≈ 0.632.
11. P(X = 0) = e^(−0.75) ≈ 0.472.

Esos son los números con los que se puede defender la pestaña sin mover ningún control.
