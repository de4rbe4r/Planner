const uri = '/api/workers';
workers = [];
message = '';

function getWorkers() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayWorkers(data))
        .catch(error => alert('Ошибка при получении списка работников. ' + error));
}

function findWorker() {
    const name = document.getElementById('name').value;
    const sename = document.getElementById('sename').value;
    const position = document.getElementById('position').value;

    if (name == "" && sename == "" && position == "") {
        alert("Заполните одно из полей!");
        return;
    }

    fetch(uri + "/find/" + name + "," + sename + "," + position)
        .then(response => response.json())
        .then(data => _displayWorkers(data))
        .catch(error => alert('Ошибка при получении списка работников. ' + error));
}

function addWorker() {
    const name = document.getElementById('name');
    const sename = document.getElementById('sename');
    const position = document.getElementById('position');

    const worker = {
        name: name.value,
        sename: sename.value,
        position: position.value
    };

    fetch(uri, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(worker)
    })
        .then(response => response.json())
        .then((data) => {
            if (data.detail == undefined) {
                alert("Работник " + data.name + ' ' + data.sename + ' с должностью ' + data.position + ' успешно создан!');
            } else {
                alert(data.detail);
            }
            name.value = '';
            sename.value = '';
            position.value = '';
        })
        .catch(error => {
            alert('Ошибка при создании работника. ' + error);
            console.log(error);
        })
}

function updateEditForm(id) {
    const worker = workers.find(w => w.id == id);

    document.getElementById('edit-id').value = worker.id;
    document.getElementById('edit-name').value = worker.name;
    document.getElementById('edit-sename').value = worker.sename;
    document.getElementById('edit-position').value = worker.position;
}

function updateWorker() {
    const workerId = document.getElementById('edit-id').value;
    const worker = {
        id: parseInt(workerId, 10),
        name: document.getElementById('edit-name').value,
        sename: document.getElementById('edit-sename').value,
        position: document.getElementById('edit-position').value
    };

    fetch(`${uri}/${workerId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(worker)
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "WorkersList.html") getWorkers();
            else if (page[page.length - 1] == "FindWorker.html") findWorker();
        })
        .catch(error => alert('Ошибка при редактировании работника. ' + error));
    document.getElementById('btnCloseModal').click();
}

function deleteWorker(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "WorkersList.html") getWorkers();
            else if (page[page.length - 1] == "FindWorker.html")  findWorker();
        })
        .catch(error => alert('Ошибка при удалении работника. ' + error));
}


function _displayWorkers(data) {
    const tBody = document.getElementById('workersList');
    tBody.innerHTML = '';

    const button = document.createElement('button');

    if (data.length == 0) {
        alert("Запрашиваемый список работников пуст!");
        return;
    }

    data.forEach(worker => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Редактировать';
        editButton.className = "btn btn-primary";
        editButton.setAttribute('onclick', `updateEditForm(${worker.id})`);
        editButton.setAttribute('data-bs-toggle', `modal`);
        editButton.setAttribute('data-bs-target', `#editModal`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Удалить';
        deleteButton.className = "btn btn-danger";
        deleteButton.setAttribute('onclick', `deleteWorker(${worker.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let textNode1 = document.createTextNode(worker.id);
        td1.appendChild(textNode1);

        let td2 = tr.insertCell(1);
        let textNode2 = document.createTextNode(worker.sename);
        td2.appendChild(textNode2);

        let td3 = tr.insertCell(2);
        let textNode3 = document.createTextNode(worker.name);
        td3.appendChild(textNode3);

        let td4 = tr.insertCell(3);
        let textNode4 = document.createTextNode(worker.position);
        td4.appendChild(textNode4);

        let td5 = tr.insertCell(4);
        if (worker.projects.length == 0) {
            let textNode5 = document.createTextNode('---');
            td5.appendChild(textNode5);
        } else {
            projects = '';
            worker.projects.forEach(project => {
                projects += project.title + ". ";
            });
            let textNode5 = document.createTextNode(projects);
            td5.appendChild(textNode5);
        }

        let td6 = tr.insertCell(5);
        td6.appendChild(editButton);

        let td7 = tr.insertCell(6);
        td7.appendChild(deleteButton);
    });

    workers = data;

}