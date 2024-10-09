// Inicializamos arrays vacíos para almacenar personas y gastos
const people = []; // name; totalExpense; puso
const expenses = []; //description; amount; person; consumedBy

// Función para agregar una persona
function addPerson() {
    const personName = document.getElementById('personName').value.trim(); // Lee la persona
    if (personName) { // Valida
        people.push({ name: personName, totalExpense: 0, puso:0 });// Lo carga a los arreglos
        renderPeople();// Actualiza
        renderExpensePersons();// Actualiza
        renderSummary();// Actualiza
        renderConsumedByCheckboxes();
        document.getElementById('personName').value = '';// Prepara nuevamente el campo
    }
}
// Función para renderizar la lista de personas
function renderPeople() {
    const peopleList = document.getElementById('people');// Trae el <ul> de personas
    peopleList.innerHTML = '';// Lo limpia
    people.forEach(person => { // Recorre el array people
        const li = document.createElement('li');// Se crea un elemento <li>
        li.textContent = person.name;// se cargan le cargan los nombres
        li.innerHTML += `<button class="delete-btn" onclick="deletePerson('${person.name}')"><i class="fa fa-trash"></i></button>`;
        peopleList.appendChild(li);// El elemento <li> se agrega como hijo de peopleList
    });
}

function deletePerson(name) {
    // Verificar si la persona ha hecho algún gasto
    const hasExpenses = expenses.some(expense => expense.person === name);
    if (hasExpenses) {
        alert("No se puede eliminar a esta persona porque puso teka");
        return; // Salir de la función si la persona tiene gastos
    }
    const hasConsumedExpenses = expenses.some(expense => expense.consumedBy.includes(name));
    if (hasConsumedExpenses) {
        alert("No se puede eliminar a esta persona porque debe teka");
        return; // Salir de la función si la persona ha consumido gastos
    }

    // Continuar con la eliminación de la persona
    const index = people.findIndex(person => person.name === name);
    if (index !== -1) {
        people.splice(index, 1);
        renderPeople(); // Actualiza la lista de personas
        renderExpensePersons(); // Actualiza las opciones de los consumidores
        renderSummary(); // Actualiza el resumen
        renderConsumedByCheckboxes(); // Actualiza las casillas de verificación de consumidores
    }
}

// Agregar evento de tecla presionada al campo de entrada de texto
document.getElementById('personName').addEventListener('keyup', function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        addPerson();
    }
});

// Función para renderizar las opciones de persona en los gastos
function renderExpensePersons() {
    const select = document.getElementById('expensePerson');
    select.innerHTML = '';
    people.forEach(person => {
        const option = document.createElement('option');
        option.value = person.name;
        option.textContent = person.name;
        select.appendChild(option);
    });
}

// Función para agregar un gasto
function addExpense() {
    const description = document.getElementById('expenseDescription').value.trim();//Descripcion
    const amount = parseFloat(document.getElementById('expenseAmount').value.trim());//Monto
    const person = document.getElementById('expensePerson').value;//Quien lo pagó
    const consumedByCheckboxes = document.querySelectorAll('#consumedByCheckboxes input[type="checkbox"]');
    const consumedBy = Array.from(consumedByCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    if (description && amount && person && consumedBy.length > 0) {
        const expense = { description, amount, person, consumedBy };

        expenses.push(expense);

        // Actualizar lo que "puso" el pagador
        updatePuso(person, amount);

        // Dividir el gasto entre los consumidores (excepto el que pagó)
        const consumers = consumedBy.filter(consumer => consumer !== person);
        const amountPerConsumer = amount / consumedBy.length;

        consumers.forEach(consumer => {
            updateTotalExpense(consumer, -amountPerConsumer); // Lo que cada consumidor debe
        });

        // El pagador también consume una parte del gasto si está en la lista de consumidores
        if (consumedBy.includes(person)) {
            updateTotalExpense(person, -(amountPerConsumer)); // Lo que debe descontarse del pagador
        }

        renderExpenses();  // Actualiza la lista de gastos
        renderSummary();    // Actualiza el resumen de personas
        renderConsumedByCheckboxes();  // Actualiza las casillas de consumidores
        renderExpensesTable(); // Actualiza la tabla de gastos

        // Limpiar los campos de entrada
        document.getElementById('expenseDescription').value = '';
        document.getElementById('expenseAmount').value = '';
        consumedByCheckboxes.forEach(checkbox => checkbox.checked = false); // Desmarcar casillas
    }
}


function updatePuso(personName, amount) {
    const person = people.find(p => p.name === personName);
    if (person) {
        person.puso += amount; // Agregamos lo que ha puesto en positivo
    }
}

function updateTotalExpense(personName, amount) {
    const person = people.find(p => p.name === personName);
    if (person) {
        person.totalExpense += amount; // Lo que ha consumido (restamos en negativo)
    }
}

function DebePaga(puso, totalExpense) {
    return puso + totalExpense; // Puso negativo, gasto positivo
}


// Función para renderizar el resumen de gastos
function renderSummary() {
    const summaryBody = document.getElementById('summaryBody');
    summaryBody.innerHTML = '';

    people.forEach(person => {
        const tr = document.createElement('tr');
        const puso = Math.abs(person.puso).toFixed(2); // Mostrar lo que puso como positivo
        const totalExpense = Math.abs(person.totalExpense).toFixed(2); // Mostrar el gasto como positivo

        // Cálculo de lo que debe pagar o recibir
        let amountToPay = person.puso + person.totalExpense;
        let amountToPayFormatted = '';

        // Formatear el resultado para mostrar en verde si es positivo (recibir) y rojo si es negativo (pagar)
        if (amountToPay < 0) {
            amountToPayFormatted = `<span style="color: red;">-$${Math.abs(amountToPay.toFixed(2))}</span>`;
        } else {
            amountToPayFormatted = `<span style="color: green;">$${amountToPay.toFixed(2)}</span>`;
        }

        tr.innerHTML = `<td>${person.name}</td><td>${puso}</td><td>${totalExpense}</td><td>${amountToPayFormatted}</td><td><button class="delete-btn" onclick="deletePerson('${person.name}')"><i class="fa fa-trash"></i></button></td>`;
        summaryBody.appendChild(tr);
    });
}




// Función para renderizar la tabla de gastos
function renderExpensesTable() {
    const tableBody = document.querySelector('#expensesTable tbody');
    tableBody.innerHTML = '';
    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.description}</td>
            <td>${expense.amount}</td>
            <td>${expense.person}</td>
            <td>${expense.consumedBy.join(', ')}</td>
            <td><button class="delete-btn"  onclick="deleteExpense(${index})"><i class="fa fa-trash"></i></button></td>
        `;
        tableBody.appendChild(row);
    });
}


// Función para renderizar las casillas de verificación de consumidores
function renderConsumedByCheckboxes() {
    const consumedByContainer = document.getElementById('consumedByCheckboxes');
    consumedByContainer.innerHTML = '';
    people.forEach(person => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = person.name;
        checkbox.name = 'consumedBy'; // Agregamos el atributo name para agrupar las casillas de verificación
        const label = document.createElement('label');
        label.textContent = person.name;
        consumedByContainer.appendChild(checkbox);
        consumedByContainer.appendChild(label);
        consumedByContainer.appendChild(document.createElement('br')); // Salto de línea
    });
}

// Función para renderizar la lista de gastos
function renderExpenses() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = ''; // Limpiamos la lista

    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.textContent = `${expense.description} - $${expense.amount.toFixed(2)} - Hecho por: ${expense.person} - Consumido por: ${expense.consumedBy.join(', ')}`;
        expensesList.appendChild(li);
    });
}

function deleteExpense(index) {
    const deletedExpense = expenses[index];
    const payer = deletedExpense.person;
    const consumers = deletedExpense.consumedBy;

    // Restar el gasto del total del que pagó
    const payerIndex = people.findIndex(person => person.name === payer);
    if (payerIndex !== -1) {
        people[payerIndex].puso -= deletedExpense.amount; // Le quitamos lo que puso para este gasto
    }

    // Dividir el monto del gasto entre los consumidores y restarlo de sus totales
    const amountPerConsumer = deletedExpense.amount / deletedExpense.consumedBy.length;

    consumers.forEach(consumer => {
        const consumerIndex = people.findIndex(person => person.name === consumer);
        if (consumerIndex !== -1) {
            // A cada consumidor se le resta su parte proporcional del gasto
            people[consumerIndex].totalExpense += amountPerConsumer;
        }
    });

    // Eliminar el gasto del array de gastos
    expenses.splice(index, 1);

    // Renderizar las tablas y el resumen actualizados
    renderExpenses();         // Actualiza la lista de gastos
    renderSummary();          // Actualiza el resumen de personas
    renderConsumedByCheckboxes(); // Actualiza las casillas de consumidores
    renderExpensesTable();    // Actualiza la tabla de gastos
}




// Al cargar la página, renderizamos la lista de personas, las opciones de persona en los gastos y el resumen de gastos
window.onload = function() {
    renderPeople();// Actualiza
    renderExpensePersons();// Actualiza
    renderSummary();// Actualiza
    renderConsumedByCheckboxes();// Actualiza
};
