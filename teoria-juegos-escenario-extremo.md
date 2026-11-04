# Teoría de juegos — escenario extremo (d2 vs d3)

Texto de exposición (teoría, no código). Coincide con la pestaña **Estrategia mixta** del dashboard y con el archivo `chips_bakery_mixta.nfg` resuelto en Gambit.

---

## Qué está modelando

Esta sección **no usa las utilidades de producir 250 o 400 galletas** del laboratorio. Es un **subjuego extremo** (solo d2 contra d3) con una matriz de pagos construida para forzar **alta variabilidad** y mostrar **estrategia mixta**.

Es un **juego de suma cero** de dos jugadores:

- **Chips Bakery** (fila): elige cuánto producir, pero aquí **solo** entre **d2 = 250** y **d3 = 400**. Se deja fuera d1 (100) porque en el juego completo d1 suele ser el **punto de silla**. Este escenario pregunta qué pasa si se **obliga** a la panadería a pelear con las dos estrategias **más agresivas**.
- **El mercado** (columna): no es un rival con beneficios propios, sino la **naturaleza adversa** (demanda **S1 baja** o **S2 alta**). En suma cero, lo que gana Chips lo “pierde” el mercado:

\[
u_{\text{mercado}} = -u_{\text{Chips}}
\]

Criterio: **minimax**. Chips maximiza su peor caso; el mercado minimiza la ganancia de Chips.

---

## Matriz del escenario extremo

Pagos de Chips, en **miles de dólares** (\(k\)).

| Chips \ Mercado | **S1 Baja** | **S2 Alta** |
|---|---|---|
| **d2: producir 250** | \(a = 300\) | \(b = 100\) |
| **d3: producir 400** | \(c = -100\) | \(d = 600\) |

Lectura de cada celda:

- **d2 / S1 (300):** producción media y demanda baja: aún se gana, pero no el máximo.
- **d2 / S2 (100):** la demanda alta “castiga” quedarse corto: el pago baja a 100.
- **d3 / S1 (−100):** producción alta y demanda baja: **pérdida** (inventario / costo de producir de más).
- **d3 / S2 (600):** producción alta y demanda alta: **el mejor pago** del tablero.

Esa es la lectura “extrema”: d2 es **segura pero mediocre** (nunca pierde, techo 300); d3 es **apuesta** (ganar 600 o perder 100).

---

## Por qué no hay punto de silla

Por eso hace falta estrategia mixta.

### Maximin (Chips, criterio pesimista)

En cada fila se toma el **mínimo**, y luego el **máximo** de esos mínimos.

- d2: \(\min(300, 100) = 100\)
- d3: \(\min(-100, 600) = -100\)
- **Maximin = 100** (la mejor garantía en estrategia pura es d2)

### Minimax (Mercado)

En cada columna se toma el **máximo** (lo peor para el mercado), y luego el **mínimo** de esos máximos.

- S1: \(\max(300, -100) = 300\)
- S2: \(\max(100, 600) = 600\)
- **Minimax = 300**

Como **100 ≠ 300**, **no hay equilibrio en estrategias puras**.

- Si Chips se queda en d2, el mercado puede empujarla a 100 (S2).
- Si se lanza a d3, el mercado la puede hundir a −100 (S1).

Cada uno tiene incentivo a **aleatorizar**.

---

## Qué calcula la estrategia mixta

Chips juega d2 con probabilidad \(p\) y d3 con \(1-p\).  
El mercado juega S1 con probabilidad \(q\) y S2 con \(1-q\).

La idea de Nash en un 2×2 de suma cero: **hacer al rival indiferente**.

### Probabilidad óptima de Chips (\(p^*\))

Se iguala lo que gana Chips si el mercado elige S1 o S2:

\[
p\cdot 300 + (1-p)\cdot(-100) \;=\; p\cdot 100 + (1-p)\cdot 600
\]

Fórmula:

\[
p^* \;=\; \frac{d-c}{a-c-b+d} \;=\; \frac{600-(-100)}{300-(-100)-100+600} \;=\; \frac{700}{900} \;=\; \frac{7}{9} \approx 77{,}78\%
\]

Entonces:

- **d2 (250): 77,78%**
- **d3 (400): 22,22%** (\(2/9\))

En palabras: **casi siempre** producción media; **aproximadamente una de cada cuatro o cinco veces** la apuesta grande. Así no se vuelve predecible y no la explotan ni S1 ni S2.

### Probabilidad óptima del mercado (\(q^*\))

Se iguala lo que enfrenta Chips si elige d2 o d3:

\[
q^* \;=\; \frac{d-b}{a-b-c+d} \;=\; \frac{600-100}{300-100-(-100)+600} \;=\; \frac{500}{900} \;=\; \frac{5}{9} \approx 55{,}56\%
\]

- **S1 baja: 55,56%**
- **S2 alta: 44,44%** (\(4/9\))

El “adversario” pone un poco más de peso en demanda baja, porque es ahí donde d3 duele.

### Valor del juego (\(v^*\))

Es el **pago esperado** cuando ambos juegan óptimo. Da lo mismo por cualquiera de estas tres vías (son equivalentes):

\[
v^* \;=\; p^* a + (1-p^*) c \;=\; \frac{7}{9}\cdot 300 + \frac{2}{9}\cdot(-100) \;=\; \frac{1900}{9} \approx 211{,}11
\]

También:

\[
\frac{5}{9}\cdot 300 + \frac{4}{9}\cdot 100 \;=\; 211{,}11
\]

\[
\frac{7}{9}\cdot 100 + \frac{2}{9}\cdot 600 \;=\; 211{,}11
\]

**Valor del juego ≈ $211,11 k.**

Interpretación: si ambos son racionales en este subjuego extremo, Chips **no puede garantizar** los 300 de d2/S1, pero **tampoco se queda** en el piso de 100 del maximin. El mixto **sube la garantía esperada** de 100 a **211,11**, y el mercado impide que suba hasta el minimax de 300.

Orden útil para la exposición:

\[
\underbrace{100}_{\text{maximin (puro)}} \;<\; \underbrace{211{,}11}_{\text{valor mixto}} \;<\; \underbrace{300}_{\text{minimax (puro)}}
\]

Eso es lo que exige la teoría cuando no hay silla: el valor mixto queda **estrictamente en el medio**.

Gambit confirma el mismo perfil (**77,8% d2 / 22,2% d3**) y el mismo valor (**$211,11 k**).

---

## Guion corto (60–90 segundos)

> Modelamos a Chips contra un mercado adversario, suma cero. En el caso extremo **quitamos d1** y dejamos solo las dos producciones volátiles. La matriz es 300 / 100 en d2 y −100 / 600 en d3. Maximin es 100 y minimax 300: **no hay punto de silla**. Entonces el equilibrio es mixto: Chips produce 250 el **77,8%** de las veces y 400 el **22,2%**; el mercado se comporta como si la demanda baja ocurriera el **55,6%**. El valor del juego es **211,11 mil dólares**: mejor que aferrarse al peor caso de d2, peor que el escenario soñado de 300 o 600. Gambit confirma el mismo perfil y el mismo valor.

---

## Matices para preguntas

1. **No es la matriz de** \(precio \times \min(q, demanda) - costo \times q\) **del resto del dashboard.** Es un **escenario de estrés** calibrado para el informe y para Gambit.
2. **Mixto no significa “producir 283 galletas”.** Significa **aleatorizar** (o, en la práctica, fraccionar el tiempo / días / lotes) entre 250 y 400 con esas frecuencias.
3. Si alguien cambia una celda y aparece silla (maximin = minimax), **el mixto interior desaparece**: vuelve a bastar una estrategia pura.
