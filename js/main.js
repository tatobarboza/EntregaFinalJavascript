

class Producto {
  constructor(id, nombre, precio, categoria, imagen = false) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.imagen = imagen;
  }
}

class BaseDeDatos {
  constructor() {
    this.productos = [];
    this.agregarRegistro(1, "Silla Gamer", 250000, "Sillas", "silla.jpeg");
    this.agregarRegistro(2, "Rams 16GB", 10000, "Rams", "rams.jpeg");
    this.agregarRegistro(3, "Fuente 1000W", 5500, "Fuente", "fuente.jpeg");
    this.agregarRegistro(4, "Monitor 165hz", 125000, "Monitor", "monitor.jpeg");
  }

  agregarRegistro(id, nombre, precio, categoria, imagen = false) {
    const producto = new Producto(id, nombre, precio, categoria, imagen);
    this.productos.push(producto);
  }

  traerRegistros() {
    return this.productos;
  }

  registroPorId(id) {
    return this.productos.find((producto) => producto.id === id);
  }
  registrosPorNombre(palabra) {
    return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(palabra));
  }
}

const bd = new BaseDeDatos();

const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const spanCantidadProductos = document.querySelector("#cantidadProductos");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h2");
const botonComprar = document.querySelector("#botonComprar");
const botonVaciar = document.querySelector("#botonVaciar");

cargarProductos(bd.traerRegistros());

function cargarProductos(productos) {
  divProductos.innerHTML = "";
  for (const producto of productos) {
    divProductos.innerHTML += `
        <div class="producto colorTarjeta">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio}</p>
            <div class="imagen">
              <img src="img/${producto.imagen}" />
            </div>
            <a href="#" class="btn btnAgregar" data-id="${producto.id}">Agregar al carrito</a>
        </div>
    `;
  }
  const botonesAgregar = document.querySelectorAll(".btnAgregar");
  for (const boton of botonesAgregar) {
    boton.addEventListener("click", (event) => {
      event.preventDefault();
      const id = Number(boton.dataset.id);
      const producto = bd.registroPorId(id);
      carrito.agregar(producto);
    });
  }
}

class Carrito {
  constructor() {
    const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
    this.carrito = carritoStorage || [];
    this.total = 0;
    this.totalProductos = 0;
    this.itemsCarrito();
  }

  agregar(producto) {
    const productoEnCarrito = this.estaEnCarrito(producto);
    if (productoEnCarrito) {
      productoEnCarrito.cantidad++;
    } else {
      this.carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.itemsCarrito();
    Toastify({
      text: `${producto.nombre} fue agregado al carrito`,
      position: "center",
      className: "info",
      gravity: "right",
      style: {
        background: "linear-gradient(to bottom, black, blue)",
      },
    }).showToast();
  }

  estaEnCarrito({ id }) {
    return this.carrito.find((producto) => producto.id === id);
  }

  itemsCarrito() {
    this.total = 0;
    this.totalProductos = 0;
    divCarrito.innerHTML = "";
    for (const producto of this.carrito) {
      divCarrito.innerHTML += `
        <div class="productoCarrito">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <a href="#" data-id="${producto.id}" class="btn btnQuitar">Quitar del carrito</a>
        </div>
    `;
      this.total += producto.precio * producto.cantidad;
      this.totalProductos += producto.cantidad;
    }
    if (this.totalProductos > 0) {
      botonComprar.classList.remove("oculto");
      botonVaciar.classList.remove("oculto");
    } else {
      botonComprar.classList.add("oculto"); 
      botonVaciar.classList.add("oculto");
    }

    const botonesQuitar = document.querySelectorAll(".btnQuitar");
    for (const boton of botonesQuitar) {
      boton.onclick = (event) => {
        event.preventDefault();
        this.quitar(Number(boton.dataset.id));
      };
    }
    spanCantidadProductos.innerText = this.totalProductos;
    spanTotalCarrito.innerText = this.total;
  }

  quitar(id) {
    const indice = this.carrito.findIndex((producto) => producto.id === id);
    if (this.carrito[indice].cantidad > 1) {
      this.carrito[indice].cantidad--;
    } else {
      this.carrito.splice(indice, 1);
    }
    localStorage.setItem("carrito", JSON.stringify(this.carrito));
    this.itemsCarrito();
  }

  vaciar() {
    this.carrito = [];
    localStorage.removeItem("carrito");
    this.itemsCarrito();
  }
}

inputBuscar.addEventListener("keyup", () => {
  const palabra = inputBuscar.value;
  const productosEncontrados = bd.registrosPorNombre(palabra.toLowerCase());
  cargarProductos(productosEncontrados);
});

botonCarrito.addEventListener("click", () => {
  document.querySelector("section").classList.toggle("ocultar");
});

botonVaciar.addEventListener("click", () => {
  Swal.fire({
    title: '¿Desea eliminar los productos del carrito?',
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Si',
    denyButtonText: 'No',
    customClass: {
      actions: 'my-actions',
      cancelButton: 'order-1 right-gap',
      confirmButton: 'order-2',
      denyButton: 'order-3',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Su carrito ya está vacío!', '', 'success')
      carrito.vaciar();
  document.querySelector("section").classList.add("ocultar");
    } else if (result.isDenied) {
      Swal.fire('Sus productos continuan en el carrito!', '', 'success')
    }
  })
  
})

botonComprar.addEventListener("click", (event) => {
  event.preventDefault();
  Swal.fire({
    title: "Su pedido está en camino",
    text: "¡Su compra ha sido realizada con éxito!",
    icon: "success",
    confirmButtonText: "Aceptar",
  });
  carrito.vaciar();
  document.querySelector("section").classList.add("ocultar");
});

const carrito = new Carrito();
