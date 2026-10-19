# Líneas de espera en Chips Bakery

Documento de apoyo para la pestaña **Líneas de espera** del dashboard. Explica qué problema se está resolviendo, qué sistema se modela y qué significa cada número que aparece en pantalla.

---

## 1. Qué problema se busca resolver

Chips Bakery no solo decide cuántas galletas hornear. También tiene que atender a quien llega al mostrador. Si los pedidos llegan más rápido, o de forma más irregular, de lo que los canales pueden despacharlos, se forma una fila.

Esa fila tiene un costo aunque no salga en la matriz de producción: el cliente espera, se impacienta o se va. Abrir otro canal también tiene un costo. El estudio de la cola sirve para ver ese equilibrio con números.

La pregunta concreta de esta pestaña es:

> Con c canales idénticos y una sola fila, ¿qué tan ocupado está cada canal, cuántas personas esperan en promedio, cuánto tiempo pasan en la fila y qué probabilidad hay de encontrar el sistema vacío o de tener que esperar?

No responde cuántas galletas producir (100, 250 o 400). Eso sigue en contexto, sensibilidad, Bayes y teoría de juegos. Aquí el objeto es la **ventanilla de pedidos**.

---

## 2. Qué sistema se está modelando

Se usa un modelo de teoría de colas llamado **M/M/c**. La notación de Kendall se lee así:

| Letra | Significado en Chips Bakery |
| --- | --- |
| Primera **M** | Las llegadas son markovianas: el número de clientes que entra en un minuto sigue una distribución de Poisson. El tiempo entre una llegada y la siguiente es exponencial. |
| Segunda **M** | El tiempo de servicio también es markoviano: exponencial, con una tasa media μ **en cada canal**. |
| **c** | Hay c canales idénticos. Una sola fila, y quien llega pasa al primer canal libre. |

Supuestos que acompañan a ese nombre:

- **Población.** La clientela posible se trata como infinita.
- **Cola.** Si todos los canales están ocupados, quien llega espera. La sala no tiene tope.
- **Disciplina.** FIFO. No hay prioridades ni una fila distinta por canal.
- **Salida.** Al terminar el servicio, el cliente sale del sistema.
- **Estado estable.** Los promedios valen cuando ya pasó el arranque del día y la llegada no supera, en promedio, a la capacidad conjunta cμ.

Unidades de trabajo: **clientes (o pedidos) por minuto**.

Con c = 1 el modelo se reduce al de un solo empleado.

---

## 3. De dónde salen λ y μ

Los datos no son un supuesto suelto. Salen de una muestra de la ventanilla en el pico de la mañana (10:00 a 12:00) de dos sábados, el 4 y el 11 de octubre.

Ocho franjas de 30 minutos, 240 minutos en total, 180 llegadas:

| Día | Franja | Llegadas |
| --- | --- | --- |
| Sábado 4 oct | 10:00–10:30 | 22 |
| Sábado 4 oct | 10:30–11:00 | 24 |
| Sábado 4 oct | 11:00–11:30 | 21 |
| Sábado 4 oct | 11:30–12:00 | 23 |
| Sábado 11 oct | 10:00–10:30 | 20 |
| Sábado 11 oct | 10:30–11:00 | 25 |
| Sábado 11 oct | 11:00–11:30 | 23 |
| Sábado 11 oct | 11:30–12:00 | 22 |

λ = 180 / 240 = **0.75** clientes por minuto (45 por hora).

Se cronometraron 20 servicios con el empleado ocupado. Los tiempos, en minutos, son 0.4, 0.6, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 0.7, 1.5, 0.5, 1.3, 0.8, 1.0, 1.6, 0.9, 1.1, 0.6, 1.2 y 1.4. La media es 1 minuto, así que μ = **1** pedido por minuto en cada canal (60 por hora). Los canales se tratan como idénticos.

Con un solo mostrador esa afluencia dejaba ρ = 0.75 y una espera media de 3 minutos. Por eso se abrió un segundo canal con la misma velocidad. Esa es la razón de c = 2.

La pantalla no lista esas franjas. El botón **Exportar PDF** abre el informe: la muestra, la comparación de un canal contra los canales elegidos (con las tasas de la muestra) y el desarrollo algebraico de los controles que estén puestos en ese momento.

---

## 4. El caso de clase que abre la pestaña

Al entrar, los deslizadores están en el ejemplo de la clase 8:

- c = **2** canales.
- λ = **0.75** clientes por minuto.
- μ = **1** cliente por minuto en cada canal.

El sistema se estabiliza porque 0.75 es menor que 2 × 1. Los resultados que deben verse son:

| Medida | Valor | Lectura en la panadería |
| --- | --- | --- |
| ρ | 0.375 | Cada canal está ocupado el 37.5 % del tiempo. |
| P0 | 0.4545 | Cerca del 45 % del tiempo no hay nadie en la ventanilla. |
| Pw | 0.2045 | Cerca del 20 % de quienes llegan tienen que esperar. Ya no coincide con ρ. |
| Lq | 0.1227 | En promedio hay muy poca gente en la fila, sin contar a quien está siendo atendido. |
| L | 0.8727 | En promedio hay 0.87 clientes en todo el sistema (fila + canales). |
| Wq | 0.1636 min | Quien llega espera, en promedio, unos 10 segundos antes de que empiece su pedido. |
| W | 1.1636 min | En total pasa poco más de un minuto desde que llega hasta que sale. |
| P(N ≥ 5) | 0.0108 | Hay cerca de un 1.1 % de probabilidad de encontrar 5 o más clientes en el sistema. |

Si se mueven λ, μ o c, las tarjetas se recalculan. El caso de clase es solo el punto de partida. El botón **Caso base** del laboratorio devuelve también c, n, x y t (2, 5, 0 y 1).

---

## 5. Qué significa cada símbolo

### λ (lambda): tasa de llegada

Cuántos clientes entran **en promedio** por minuto. λ = 0.75 significa que, a la larga, entran 0.75 personas por minuto, es decir 45 por hora.

### μ (mu): tasa de servicio por canal

Cuántos pedidos puede completar **un** canal **en promedio** por minuto, si está ocupado todo el tiempo. μ = 1 significa 60 pedidos por hora en ese canal, o un servicio medio de 1/μ = **1 minuto**.

La capacidad conjunta es cμ. Con dos canales, 2 pedidos por minuto si ambos están ocupados.

### c: cantidad de canales

Entero de 1 a 5. Los canales son iguales. No hay una fila por canal: hay una fila común.

### ρ (rho): utilización

ρ = λ / (cμ).

Es la fracción del tiempo en que **cada** canal está ocupado. Con λ = 0.75, μ = 1 y c = 2, ρ = 0.375.

Con un solo canal, ρ = λ/μ y además Pw = ρ. Con dos o más, Pw es menor que ρ: hace falta que **todos** los canales estén ocupados para que el que llega espere.

### Condición de estabilidad

ρ < 1, es decir λ < cμ.

Si llegan más clientes por minuto de los que el conjunto de canales puede atender, la cola tiende a infinito. En ese caso la pestaña deja en blanco P0, Lq, L, Wq, W y Pw. La Poisson de las llegadas y la exponencial del servicio siguen teniendo sentido.

---

## 6. Medidas de desempeño

Todas son **promedios o probabilidades de estado estable**. Sea r = λ/μ.

### P0: probabilidad de que el sistema esté vacío

P0 = [ Σ_{n=0}^{c−1} r^n / n! + r^c / (c! (1 − ρ)) ]^(−1).

En el caso de clase, 1 / 2.2 = 0.4545.

### Pw: probabilidad de esperar

Pw = [ r^c / (c! (1 − ρ)) ] × P0.

Es la probabilidad de que, al llegar, los c canales ya estén ocupados. En el caso de clase, 0.2045. No es lo mismo que Wq: uno es una probabilidad y el otro es un tiempo.

### Lq: número promedio en la línea de espera

Lq = P0 × r^c × ρ / [ c! (1 − ρ)^2 ].

Cuenta solo a quienes **esperan**. En el caso de clase, 0.1227. El dibujo redondea ese promedio: con 0.12 se ven cero puntos.

### L: número promedio en el sistema

L = Lq + λ/μ.

λ/μ es el número medio de clientes en servicio, repartido entre los c canales. En el caso de clase: 0.1227 + 0.75 = 0.8727. En el dibujo, 0.75 llena en parte el primer canal y deja el segundo libre.

### Wq y W

Wq = Lq / λ. W = Wq + 1/μ.

En el caso de clase, Wq = 0.1636 minutos y W = 1.1636 minutos. La relación longitud media = tasa × tiempo medio es la ley de Little.

### Pn y P(N ≥ n)

Si n ≤ c, Pn = P0 × r^n / n!.

Si n > c, Pn = P0 × r^n / (c! × c^(n−c)).

El deslizador **n** elige ese número y, al lado, la cola P(N ≥ n) = 1 − Σ_{i=0}^{n−1} Pi. Con n = 5 y los datos de clase, P(N ≥ 5) ≈ 0.0108.

---

## 7. Las dos distribuciones de la parte de abajo

No cambian al pasar de un canal a varios.

### Llegadas: Poisson

P(X = x) = λ^x × e^(−λ) / x!.

X es cuántos clientes entran **durante un minuto**. Con λ = 0.75 y x = 0, cerca de 0.472.

### Servicio: exponencial

P(T ≤ t) = 1 − e^(−μ t).

T es cuánto dura el servicio de un cliente en un canal. Con μ = 1:

- t = 0.5 → cerca de 0.393.
- t = 1 → cerca de 0.632.

---

## 8. Para qué sirve mover los deslizadores

- Subir λ alarga Lq y Wq, y acerca ρ a 1.
- Subir μ acorta la fila y baja la ocupación de cada canal.
- Subir c reparte la misma llegada. En el caso de clase, Wq pasa de 3 minutos con un canal a 0.16 minutos con dos.
- Si λ alcanza o pasa a cμ, el modelo avisa que la ventanilla no da abasto.

La pestaña no calcula el costo en dinero. Muestra el efecto sobre la espera para que ese costo se pueda comparar aparte.

---

## 9. Qué no está haciendo esta pestaña

- No usa el precio, el costo ni la demanda de 100, 250 o 400 galletas.
- No dice cuánto producir mañana.
- No asigna un costo monetario a cada minuto de espera ni a cada canal extra.
- No parte la fila en una cola por canal.
- Los promedios no describen la primera media hora del día. Describen el régimen de estado estable.
- La muestra de los dos sábados no se edita en pantalla. Vive en el PDF.

---

## 10. Sustitución del caso de clase, paso a paso

Datos: c = 2, λ = 0.75, μ = 1. Entonces r = 0.75 y ρ = 0.75 / 2 = 0.375.

1. Suma hasta c − 1: 1 + 0.75 = 1.75.
2. Término de cola: (0.75)^2 / (2 × 0.625) = 0.5625 / 1.25 = 0.45.
3. P0 = 1 / (1.75 + 0.45) = 1 / 2.2 = 0.4545.
4. Pw = 0.45 × 0.4545 = 0.2045.
5. Lq = (1/2.2) × 0.5625 × 0.375 / (2 × 0.625^2) = 0.1227. La hoja de clase redondea P0 a 0.4545 antes de multiplicar y por eso anota 0.1229.
6. L = 0.1227 + 0.75 = 0.8727.
7. Wq = 0.1227 / 0.75 = 0.1636 minutos.
8. W = 0.1636 + 1 = 1.1636 minutos.
9. P(N ≥ 5) = 1 − (P0 + P1 + P2 + P3 + P4) ≈ 0.0108.

Esos son los números con los que se puede defender la pestaña sin mover ningún control.
