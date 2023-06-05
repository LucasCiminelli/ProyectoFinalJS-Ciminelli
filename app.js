// DATOS CAPTURADOS DEL DOM

const contenedorProd = document.getElementById("contenedorProductos");
const abrirCarrito = document.getElementById("abrirCarrito");
const modalContainer = document.getElementById("modalContainer");
const formBuscador = document.getElementById("formBuscador");
const inputBuscador = document.getElementById("inputBuscador");
const botonBuscador = document.getElementById("botonBuscador");

////////////-- CARRITO INICIALIZADO COMO AQUELLO QUE ENCUENTRE EN EL LOCAL --//////////
////////////-- OR(||) UN ARRAY VACIO EN CASO DE NO HABER NADA --//////////

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

///////////////////////////////////-- CREANDO CONTAINER PARA LOS PRODUCTOS --////////////////////////////////////////////
/////////////////////////////////////////-- Y PINTANDOLOS EN EL DOM --///////////////////////////////////////////////////

/// funcion async, fetch.

const traerProductos = async () => {
  const response = await fetch("data.json");
  const data = await response.json();

  data.forEach((producto) => {
    let contenido = document.createElement("div");
    contenido.className = "card";
    contenido.innerHTML = `
          <img src="${producto.img}">
          <h3>${producto.nombre}</h3>
          <p class="parrafo-precio">$${producto.precio}</p>
      `;
    contenedorProd.append(contenido);

    let botonComprar = document.createElement("button");
    botonComprar.innerHTML = `Añadir al carrito <i class="bi bi-bag-check"></i>`;
    botonComprar.className = "btn btn-dark";

    contenido.append(botonComprar);

    ///////////////////////////////-- FUNCION PARA SUMAR CANTIDADES --/////////////////////////////////////////////
    ///// Detecta si el producto existe en carrito(true/false)
    ///// si existe cantidad++ sino lo pushea.
    ///// tanto si lo suma como si lo pushea, aparece un toastify confirmando que el producto fue añadido.

    botonComprar.addEventListener("click", () => {
      const repetido = carrito.some(
        (productoRepetido) => productoRepetido.id === producto.id
      );

      if (repetido) {
        carrito.map((productoCarrito) => {
          if (productoCarrito.id === producto.id) {
            productoCarrito.cantidad++;

            Toastify({
              text: `${producto.nombre} añadido al carrito ✅ `,

              style: {
                background: "#333",
                color: "white",
              },
            }).showToast();
          }
        });
      } else {
        carrito.push({
          id: producto.id,
          img: producto.img,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad,
        });

        Toastify({
          text: `${producto.nombre} añadido al carrito ✅ `,

          style: {
            background: "#333",
            color: "white",
          },
        }).showToast();
      }
      guardarEnLocal();
    });

    /////////////////////////////////////-- FILTRO DE BARRA DE BUSQUEDA --////////////////////////////////////////////////
    //// crea un evento en el input de la barra de busqueda.
    //// creo una constante donde se almacena lo que escribe el usuario letra por letra.
    //// selecciono del contenedor todos los elementos con la clase card e itero todos los productos
    //// busco en los productos todos los h3 que vendrian siendo los nombres y su texto lo llevo a minusculas tambien
    //// luego con if pregunto si lo que escribe el usuario en la barra de busqueda coincide con algun nombre de producto
    //// si coincide remuevo la clase filtro que da display none a los productos y agrego filtro a la foto de inicio
    //// si no coincide le aplico el display none para que no aparezcan.
    //// si no se escribe nada devuelvo el dom al estado original y devuelvo la imagen de inicio.
    //// si la búsqueda no coincide con ningún producto, doy display none a todas las card y le doy display block
    //// al mensaje "Producto no encontrado..." que inicialmente tiene display none.

    inputBuscador.addEventListener("keyup", (e) => {
      const busquedaUsuario = e.target.value.toLowerCase();
      const mensajeNoEncontrado = document.getElementById(
        "mensajeNoEncontrado"
      );

      contenedorProd.querySelectorAll(".card").forEach((producto) => {
        const nombre = producto.querySelector("h3").textContent.toLowerCase();
        const fotoRecepcion = document.querySelector(".foto-recepcion");

        if (nombre.includes(busquedaUsuario)) {
          producto.classList.remove("filtro");
          fotoRecepcion.classList.add("filtro");
        } else {
          producto.classList.add("filtro");
        }

        if (busquedaUsuario === "") {
          fotoRecepcion.classList.remove("filtro");
        }

        productoFiltrados =
          contenedorProd.querySelectorAll(".card:not(.filtro)");

        if (productoFiltrados.length === 0) {
          mensajeNoEncontrado.style.display = "block";
        } else {
          mensajeNoEncontrado.style.display = "none";
        }
      });
    });
  });
};

traerProductos();

//////////////////////////////////////-- FUNCION PINTAR CARRITO --////////////////////////////////////////////////////////

const productosEnCarrito = () => {
  ///-- INICIALIZAR EL MODAL COMO UN INNER HTML VACIO PARA QUE NO REPITA EL PROCESO DE CREACION CADA VEZ QUE SE CLICKEE --///
  //-- CADA VEZ QUE CLICKEA BORRA TODO Y CREA TODO DE NUEVO Y LE DA DISPLAY FLEX PARA QUITAR EL DISPLAY NONE --//

  modalContainer.innerHTML = "";
  modalContainer.style.display = "flex   ";

  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header light bg-light py-2";
  modalHeader.innerHTML = `
    <h2 class="modal-header-title">Carrito</h2>
    `;
  modalContainer.append(modalHeader);

  //////////////////////////-- CREANDO BOTON PARA CERRAR ("X") QUE LE DA DISPLAY NONE AL MODAL AL CLICKEAR --///////////////////

  const modalBotonCerrar = document.createElement("h1");
  modalBotonCerrar.innerHTML = `<i class="bi bi-x-lg"></i>`;
  modalBotonCerrar.className = "modal-header-button";

  modalBotonCerrar.addEventListener("click", () => {
    modalContainer.style.display = "none";
  });

  modalContainer.append(modalBotonCerrar);

  ////////////////-- CON forEach CREO EL CONTENIDO DEL MODAL POR CADA PRODUCTO AGREGADO AL CARRITO --//////////////////////////

  carrito.forEach((producto) => {
    let carritoContenido = document.createElement("div");
    carritoContenido.className = "modal-contenido";
    carritoContenido.innerHTML = `
      <img src="${producto.img}">
      <h3>${producto.nombre}</h3>
      <p>$${producto.precio}</p>
      <p id="menos" class="menos"> - </p>
      <p> Cantidad: ${producto.cantidad}</p>
      <p id="mas" class="mas"> + </p>
      <p> Subtotal: ${producto.precio * producto.cantidad}</p>
      <span class="boton-eliminar"> ❌</span>
    `;

    modalContainer.append(carritoContenido);

    /////////////-- AL TOCAR EL BOTON ELIMINAR DEL CARRITO ELIMINA EL PRODUCTO BUSCANDOLO POR EL ID --/////////////////////////
    /////////////////////////////////-- Y ACTUALIZA EL CARRITO Y EL STORAGE --/////////////////////////////////////////////////

    let botonEliminar = carritoContenido.querySelector(".boton-eliminar");
    botonEliminar.addEventListener("click", () => {
      eliminarProducto(producto.id);
      guardarEnLocal();
    });

    ///////////-- AL TOCAR EL BOTON DE RESTA(-), SE DISMINUYE LA CANTIDAD EN 1 SIEMPRE QUE LA CANTIDAD SEA MAYOR A 1 --///////////
    ///-- Si es 1 no resta más, para evitar llegar al 0 o a numeros negativos de cantidad
    ///-- Actualiza el carrito y el local cada vez que resta.

    let botonRestar = carritoContenido.querySelector("#menos");
    botonRestar.addEventListener("click", () => {
      if (producto.cantidad > 1) {
        producto.cantidad--;
        productosEnCarrito();
        guardarEnLocal();
      }
    });

    ///////////////////-- AL TOCAR EL BOTON DE SUMA(+), SUMA 1 SIEMPRE QUE LA CANTIDAD SEA MAYOR O IGUAL A 1 --////////////////
    ///-- Actualiza el carrito y el local cada vez que suma.

    let botonSumar = carritoContenido.querySelector("#mas");
    botonSumar.addEventListener("click", () => {
      if (producto.cantidad >= 1) {
        producto.cantidad++;
        productosEnCarrito();
        guardarEnLocal();
      }
    });
  });

  //////////////////-- REDUCE PARA CALCULAR EL TOTAL DE LOS VALORES DE CADA PRODUCTO X LA CANTIDAD --////////////////////////

  const totalCarrito = carrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );

  //////////////////////-- CREANDO EL FOOTER DEL CARRITO, CON BOTON VACIAR CARRITO Y FINALIZAR COMPRA --/////////////////////
  ///////////////////////-- botonVaciarCarrito ACTUALIZA EL CONTENIDO DEL CARRITO Y EL LOCALSTORAGE --///////////////////////

  const carritoFooter = document.createElement("div");
  carritoFooter.className = "carrito-footer light bg-light";
  carritoFooter.innerHTML = "";

  modalContainer.append(carritoFooter);

  const totalModal = document.createElement("span");
  totalModal.className = "total-modal";
  totalModal.innerHTML = `
  Total: $${totalCarrito}
`;

  carritoFooter.append(totalModal);

  /////////////-- botonFinalizarCompra CREA UN DIV AL FINAL DEL FOOTER CON UN FORMULARIO PARA INGRESO DE DATOS --////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const botonFinalizarCompra = document.createElement("button");
  botonFinalizarCompra.innerHTML = `Finalizar compra  <i class="bi bi-cart-check"></i>`;
  botonFinalizarCompra.className = "boton-finalizar btn btn-light ";

  carritoFooter.append(botonFinalizarCompra);

  const botonVaciarCarrito = document.createElement("button");
  botonVaciarCarrito.innerHTML = `Vaciar Carrito <i class="bi bi-trash"></i>`;
  botonVaciarCarrito.className = "boton-vaciar btn btn-light";

  carritoFooter.append(botonVaciarCarrito);

  botonVaciarCarrito.addEventListener("click", () => {
    vaciarCarrito();
    productosEnCarrito();
    guardarEnLocal();
  });

  /////////////////////////////////-- TOMA EL DATO DE LA CLASE FORMULARIO. SI NO EXISTE LO CREA --///////////////////////////
  ///////////////////////////////-- DE ESTA MANERA EVITE  EL LOOP DE CREAR INFINITAS VECES EL FORM --////////////////////////
  /////////////////////////////////////-- SI EL CARRITO ESTÁ VACIO NO HABILITA EL FORMULARIO --//////////////////////////////

  botonFinalizarCompra.addEventListener("click", () => {
    const formularioExistente = document.querySelector(".formulario");

    if (!formularioExistente && carrito.length >= 1) {
      const flecha = document.createElement("span");
      flecha.innerHTML = `
      <span> <i class="flecha bi bi-arrow-down"></i></span>
      `;
      modalContainer.append(flecha);

      const formulario = document.createElement("div");
      formulario.className =
        "formulario d-flex flex-column justify-content-center align-items-center";
      formulario.innerHTML = `

        <h3 class="text-center pt-3"> Finalice su compra </h3>
        <form>
            <div class="row g-3 pt-3 pb-2">
                <div class="col">
                    <input type="text" id="inputNombre" class="form-control" placeholder="Nombre" aria-label="First name">
                </div>
                <div class="col">
                    <input type="email" id="inputEmail" class="form-control" placeholder="Email" aria-label="Email">
                </div>
            </div>
            <div class="col-12 pb-4">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value=""  aria-describedby="invalidCheck3Feedback" required>
                    <label class="form-check-label" for="invalidCheck3">
                        Acepta los terminos y condiciones
                    </label>
                </div>
             </div>
            
        
        </form>
        <button class="boton-comprar btn btn-light mb-5"> Comprar <i class="bi bi-check2"></i> </button>
    
    `;

      modalContainer.append(formulario);
      formulario.scrollIntoView({ behavior: "smooth" });
    }

    const botonComprar = document.querySelector(".boton-comprar");

    botonComprar.addEventListener("click", () => {
      const inputEmail = document.querySelector("#inputEmail");
      const inputNombre = document.querySelector("#inputNombre");

      if (inputEmail.value == "" || inputNombre.value == "") {
        /// Sweet alert de error porque no se rellenaron los campos.
        Swal.fire({
          icon: "error",
          title: "Rellene los campos solicitados",
          text: "Ingrese su Nombre y su Email para finalizar la compra",
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        ////////////////-- SI LA COMPRA ES EXITOSA VACÍA EL CARRITO, VUELVE A PINTARLO (VACIO) Y GUARDA EN LOCAL --////////////////////////

        /// Sweet alert de exito porque la compra fue exitosa.
        Swal.fire({
          icon: "success",
          title: `${inputNombre.value}, se ha registrado una compra por una suma total de: $${totalCarrito}. 
            ¡Gracias por comprar con nosotros!♥`,
          html: `Recibirá a ${inputEmail.value} un Email con los próximos pasos a seguir`,
          showConfirmButton: false,
          timer: 7000,
        });

        vaciarCarrito();
        productosEnCarrito();
        guardarEnLocal();
      }
    });
  });
};

abrirCarrito.addEventListener("click", productosEnCarrito);

/////////////////////////////////-- FUNCION ELIMINAR PRODUCTO --///////////////////////////////////////////////////////////
//////////////////////-- BUSCA EL ID DEL PRODUCTO QUE COINCIDA CON EL ID INGRESADO --//////////////////////////////////////
//////////////////-- Y FILTRA EL CARRITO PARA DEVOLVER TODOS LOS PRODUCTOS EXCEPTO ESE --//////////////////////////////////

const eliminarProducto = (id) => {
  const encontrarProducto = carrito.find((producto) => producto.id === id);

  carrito = carrito.filter((productoId) => {
    return productoId !== encontrarProducto;
  });

  productosEnCarrito();
};

///////////////////////////////////////-- FUNCION VACIAR CARRITO --////////////////////////////////////////////////////////
///// REINICIA TODO

const vaciarCarrito = () => {
  carrito = [];
  totalCarrito = 0;
};

///////////////////////////////////////-- FUNCION PARA GUARDAR EN LOCAL STORAGE --////////////////////////////////////////

const guardarEnLocal = () => {
  localStorage.setItem("carrito", JSON.stringify(carrito));
};

//// RECUPERAR DATOS DEL LOCAL STORAGE ////

JSON.parse(localStorage.getItem("carrito"));
