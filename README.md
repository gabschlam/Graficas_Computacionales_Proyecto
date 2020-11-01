# Cinderella Story
## Equipo 3
##### Gabriel Schlam Huber - A01024122
##### Alejandra Nissan Leizorek - A01024682
##### Samantha Barco Mejia - A01196844

## Requerimientos funcionales
1. Crear un cuento interactivo para niños de 6 a 12 años.
2. Al inicio de cada escena, los personajes entrarán y realizarán una animación sencilla.
3. Habrá como mínimo dos objetos por cada escena con los que el usuario podrán interactuar.
4. La cámara tendrá movimiento en cada escena.
5. La historia del cuento aparecerá como texto, conforme al flujo de los personajes, para poder dar un seguimiento a la historia.
6. Habrán un total de seis escenas de la historia.
A continuación se explicará cada una de ellas:

    * Escena 1:
    Esta escena será la portada, en ella lucirá la icónica zapatilla de cenicienta con y además una mariposa que estará postrada en la escena (quizá en el título). Para esta primera escena no queremos que la zapatilla y la mariposa entren, sino que siempre estará dentro para hacerlucir la protada. Además, estará el título y nuestros nombres.
        Objetos interactuables:
        - Zapatilla: al precionarla esta rotará en y para lucir su increible diseño. 
        - Mariposa: cuando se presione hará un recorrido de vuelo. 

    * Escena 2:
    Esta escena ilustra lo infeliz que era Cenicienta, la escena comenzará vacía, posteriormente entrará Cenicienta con su cubeta de agua y luego las hermanastras y sumadrastra. 
        Objetos interactuables:
        - Cubeta con agua: cuando se presione esta sacará burbujas.
        - Sillón: saldrá un ratón caminando. 

    * Escena 3:
    Cuando le prohiben a Cenicienta a acudir al baile que tanto deseaba ir. Entrará Cenicienta, luego su familia y finalmente saldrá su familia y se quedará sola en la escena. 
        Objetos interactuables:
        - Fuente: la fuente sacrá gotas de agua, o quizá se eleverá y bajará (indicando que pronto llegará el ada madrina). 
        - Ratones: al presionar a Cenicienta apareceran sus ratones a acompañarla. 

    * Escena 4:
    El hada madrina aparece para ayudar a Cenicienta a acudir al baile. Cenicienta ya estará en la escena, dado que ya estaba en ese lugar en la escena anterior. Luego, aparecerá el hada madrina y el carruaje. 
        Objetos interactuables:
        - Carruaje: al precionarlo se elevará del piso (flotará) y volverá a bajar. 
        - Hada madrina: Dará vueltas

    * Escena 5:
    Cenicienta conoce al príncipe y bailan juntos. Entra primero el prícipe y luego Cenicienta a la escena. 
        Objetos interactuables:
        - Cenicienta y el príncipe: comienzan a bailar en forma de infinito. 
        - Luz: cuando se preciona cierto lugar por definit, aparece una luz que alumbra directamente al Principe y a Cenicienta. 

    * Escena 6: 
    Encuentran que a Cenicienta le queda perfectamente la zapatilla y se casa con el príncipe. Primero entra el príncipe y luego Cenicienta. 
        Objetos interactuables:
        - Ratones: al presionar algún mueble saldrán caminando. 
        - Pájaros: al precionarlos darán un recorrido de vuelo y volverán a postrarse en el mismo sitio. 

7. Implementar conocimiento de gráficos 3D y animaciones adquiridos en clase.

## ¿Cómo se van a cumplir los requerimientos?
* Se utilizarán modelos 3D, con animaciones ya sea integradas o creadas por el equipo.
* Se utilizará un mecanismo para pasar de una escena a otra, por medio de botones de siguiente y anterior.
* Utilizaremos el método de raycasting para controlar la interacción entre el usuario y los objetos con animación.
* Utilizaremos el método de transformación de CSS a objetos 3D para animar el texto de la historia.
* De momento no consideramos utilizar alguna librería adicional, pero en el transcurso del proyecto este punto podría cambiar.

## Plan de trabajo
Nuestro plan de trabajo se dividirá en diferentes sprints, con diferentes entregables a medir.
### Primer Sprint: 02/11 - 09/11
1. Modelos 3D recopilados, enlistando las animaciones que ya tiene el objeto. **¿Quién? -> Todo el equipo**
2. Cargar cada modelo y/o objeto a su respectiva escena y posición. **¿Quién? -> Todo el equipo, dividido por escenas**
3. Realizar flujo de botones de siguiente y anterior. **¿Quién? -> Gabriel**
### Segundo Sprint: 10/11 - 16/11
1. Animaciones de entrada y salida de personajes. **¿Quién? -> Todo el equipo, dividido por escenas, liderado por Alejandra**
2. Animaciones de objetos con interacción de usuario: movimiento y/o sonido (raycasting). **¿Quién? -> Todo el equipo, dividido por escenas, liderado por Samantha**
### Tercer Sprint: 17/11 - 26/11
1. Animaciones de texto de cuento. **¿Quién? -> Todo el equipo, dividido por escenas, liderado por Gabriel**
2. Animaciones de camara (alejamiento, acercamiento, etc). **¿Quién? -> Todo el equipo**
