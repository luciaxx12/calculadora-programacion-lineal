function generarInputsFuncionObjetivo() {
    const numVariables = parseInt(document.getElementById('numVariables').value);
    const container = document.getElementById('coeficientesFuncionObjetivo');
    container.innerHTML = '<h3>Coeficientes de la función objetivo:</h3>';

    if (!numVariables || numVariables <= 0) {
        alert("Por favor, ingresa un número válido de variables.");
        return;
    }

    for (let i = 0; i < numVariables; i++) {
        container.innerHTML += `x${i + 1}: <input type="number" id="coefObjetivo${i}" class="form-control d-inline-block mb-2 me-2" style="width: 100px;" step="0.1" required>`;
    }
}

function generarInputsRestricciones() {
    const numRestricciones = parseInt(document.getElementById('numRestricciones').value);
    const numVariables = parseInt(document.getElementById('numVariables').value);
    const container = document.getElementById('coeficientesRestricciones');
    container.innerHTML = '<h3>Coeficientes de las restricciones:</h3>';

    if (!numRestricciones || numRestricciones <= 0) {
        alert("Por favor, ingresa un número válido de restricciones.");
        return;
    }

    for (let i = 0; i < numRestricciones; i++) {
        container.innerHTML += `<div class="mb-3">Restricción ${i + 1}: `;
        for (let j = 0; j < numVariables; j++) {
            container.innerHTML += `x${j + 1}: <input type="number" id="coefRestriccion${i}${j}" class="form-control d-inline-block mb-2 me-2" style="width: 100px;" step="0.1" required>`;
        }
        container.innerHTML += `<= <input type="number" id="bRestriccion${i}" class="form-control d-inline-block mb-2" style="width: 100px;" step="0.1" required></div>`;
    }
}

function resetFormulario() {
    document.getElementById("coeficientesFuncionObjetivo").innerHTML = '<h3>Coeficientes de la función objetivo:</h3>';
    document.getElementById("coeficientesRestricciones").innerHTML = '<h3>Coeficientes de las restricciones:</h3>';
    document.getElementById("resultado").innerHTML = '';
}

function resolverProblema() {
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "";

    const numVariables = parseInt(document.getElementById("numVariables").value);
    const numRestricciones = parseInt(document.getElementById("numRestricciones").value);

    if (!numVariables || !numRestricciones) {
        alert("Por favor, completa todos los campos iniciales.");
        return;
    }

    const c = [];
    for (let i = 0; i < numVariables; i++) {
        const coef = parseFloat(document.getElementById(`coefObjetivo${i}`).value);
        if (isNaN(coef)) {
            alert(`Por favor, completa el coeficiente de x${i + 1} en la función objetivo.`);
            return;
        }
        c.push(coef);
    }

    const A = [];
    const b = [];
    for (let i = 0; i < numRestricciones; i++) {
        const restriccion = [];
        for (let j = 0; j < numVariables; j++) {
            const coef = parseFloat(document.getElementById(`coefRestriccion${i}${j}`).value);
            if (isNaN(coef)) {
                alert(`Por favor, completa el coeficiente de x${j + 1} en la restricción ${i + 1}.`);
                return;
            }
            restriccion.push(coef);
        }
        const bi = parseFloat(document.getElementById(`bRestriccion${i}`).value);
        if (isNaN(bi)) {
            alert(`Por favor, completa el término independiente de la restricción ${i + 1}.`);
            return;
        }
        A.push(restriccion);
        b.push(bi);
    }

    const resultado = simplexMaximizar(c, A, b);
    mostrarResultado(resultado);
}

function simplexMaximizar(c, A, b) {
    try {
        const model = {
            optimize: "z",
            opType: "max",
            constraints: {},
            variables: {}
        };

        // Construir el modelo a partir de las restricciones y variables
        A.forEach((fila, i) => {
            model.constraints[`r${i + 1}`] = { max: b[i] };
            fila.forEach((coef, j) => {
                if (!model.variables[`x${j + 1}`]) {
                    model.variables[`x${j + 1}`] = { z: c[j] };
                }
                model.variables[`x${j + 1}`][`r${i + 1}`] = coef;
            });
        });

        // Resolver el modelo con solver
        const resultado = solver.Solve(model);
        return resultado.feasible
            ? { z: resultado.result, variables: resultado }
            : { error: "No se encontró solución." };
    } catch (error) {
        return { error: `Error al resolver: ${error.message}` };
    }
}

function mostrarResultado(resultado) {
    const resultadoDiv = document.getElementById("resultado");
    if (resultado.error) {
        resultadoDiv.innerHTML = `<p class="text-danger">${resultado.error}</p>`;
        return;
    }

    resultadoDiv.innerHTML = `<h2>Resultado:</h2><p>Valor óptimo (Z): ${resultado.z.toFixed(2)}</p>`;
    resultadoDiv.innerHTML += `<h3>Valores de las variables:</h3><ul>`;
    for (const [nombre, valor] of Object.entries(resultado.variables)) {
        if (nombre !== "z") {
            resultadoDiv.innerHTML += `<li>${nombre}: ${valor.toFixed(2)}</li>`;
        }
    }
    resultadoDiv.innerHTML += "</ul>";
}
