const uriWorkers = '/api/workers';
const uriProjects = '/api/projects';
workers = [];
workersArray = [];
projects = [];
numSelect = 1;
editNumSelect = 1;

function getWorkers() {
    fetch(uriWorkers)
        .then(response => response.json())
        .then(data => _appendSelect(data))
        .catch(error => alert('Ошибка при получении списка работников. ' + error));
}

function getWorkersArray() {
    fetch(uriWorkers)
        .then(response => response.json())
        .then(data => workersArray = data)
        .catch(error => alert('Ошибка при получении списка работников. ' + error));
}

function getProjects() {
    fetch(uriProjects)
        .then(response => response.json())
        .then(data => _displayProjects(data))
        .catch(error => alert('Ошибка при получении списка проектов. ' + error));
}

function findProject() {
    const title = document.getElementById('title').value;

    fetch(uriProjects + "/find/" + title)
        .then(response => response.json())
        .then(data => _displayProjects(data))
        .catch(error => alert('Ошибка при получении списка проектов. ' + error));
}

function addProject() {
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    workersList = [];

    for (i = 1; i <= numSelect; i++) {
        var select = document.getElementById('tutor_' + i);
        workers.forEach(w => {
            if (w.id == (select.options[select.selectedIndex].value))
                workersList.push(w);
        });
    }

    const project = {
        title: title.value,
        description: description.value,
        workers: workersList
    };

    fetch(uriProjects, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    })
        .then(response => response.json())
        .then((data) => {
            if (data.detail == undefined) {
                alert("Проект " + data.title + ' успешно создан!');
            } else {
                alert(data.detail);
            }
            title.value = '';
            description.value = '';
            const divBlock = document.getElementById('tutorContainer');
            for (i = numSelect; i > 1; i--) {
                var divSelect = document.getElementById('divSelect_' + i);
                divBlock.removeChild(divSelect);
            }

        })
        .catch(error => alert('Ошибка при создании проекта. ' + error));
}

function updateEditForm(id) {
    const project = projects.find(p => p.id == id);

    document.getElementById('edit-id').value = project.id;
    document.getElementById('edit-title').value = project.title;
    document.getElementById('edit-description').value = project.description;

    _appendEditSelect(project);
}

function updateProject() {
    const projectId = document.getElementById('edit-id').value;

    workersList = [];

    for (i = 1; i <= editNumSelect; i++) {
        var select = document.getElementById('edit-tutor_' + i);
        if (select == null) continue;
        workersArray.forEach(w => {
            if (w.id == (select.options[select.selectedIndex].value))
                workersList.push(w);
        });
    }

    const project = {
        id: parseInt(projectId, 10),
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        workers: workersList
    };
    fetch(`${uriProjects}/${projectId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "ProjectsList.html") getProjects();
            else if (page[page.length - 1] == "FindProject.html") findProject();
        })
        .catch(error => alert('Ошибка при редактировании проекта. ' + error));
    document.getElementById('btnCloseModal').click();
}

function deleteProject(id) {
    fetch(`${uriProjects}/${id}`, {
        method: 'DELETE'
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "ProjectsList.html") getProjects();
            else if (page[page.length - 1] == "FindProject.html")  findProject();
        })
        .catch(error => alert('Ошибка при удалении проекта. ' + error));
}

function _appendSelect(data) {
    const select = document.getElementById('tutor_' + numSelect);

    if (data.length == 0) {
        alert("Запрашиваемый список работников пуст!");
        return;
    }

    data.forEach(worker => {
        var opt = document.createElement('option');
        opt.value = worker.id;
        opt.innerHTML = worker.sename + ' ' + worker.name + ' (' + worker.position + ')';
        select.appendChild(opt);
    });

    workers = data;
}

function _appendEditSelect(project) {
    i = 0;
    do {
        if (i != 0) addEditTutorSelect();
        const select = document.getElementById('edit-tutor_' + editNumSelect);
        selectedWorkerNum = 0;
        workersArray.forEach(worker => {
            if (i == 0) {
                var opt = document.createElement('option');
                opt.value = worker.id;
                opt.innerHTML = worker.sename + ' ' + worker.name + ' (' + worker.position + ')';
                select.appendChild(opt);
            }
            if (project.workers.length > 0 && worker.id == project.workers[i].id) {
                select.selectedIndex = selectedWorkerNum;
            }
            selectedWorkerNum++;
        });
        i++;
    } while (i < project.workers.length)  
}

function _appendNewEditSelect(workersArray) {
    const select = document.getElementById('edit-tutor_' + editNumSelect);
    workersArray.forEach(worker => {
        var opt = document.createElement('option');
        opt.value = worker.id;
        opt.innerHTML = worker.sename + ' ' + worker.name + ' (' + worker.position + ')';
        select.appendChild(opt);
    });
}

function closeModal() {
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-title').value = '';
    document.getElementById('edit-description').value = '';
    var select = document.getElementById('edit-tutor_' + 1);
    for (i = select.options.length - 1; i >= 0; i--) {
        select.remove(i);
    }
    for (i = editNumSelect; i > 1; i--) {
        const divSelect = document.getElementById('divEditSelect_' + i);
        if (divSelect != null) divSelect.remove()
    }

    editNumSelect = 1;
}

function addTutorSelect() {
    const divBlock = document.getElementById('tutorContainer');
    var divSelect = document.createElement('div');
    divSelect.id = 'divSelect_' + ++numSelect;
    divSelect.className = 'col';
    divBlock.appendChild(divSelect);

    var select = document.createElement('select');
    select.id = 'tutor_' + numSelect;
    select.className = 'col-8';
    divSelect.appendChild(select);

    const button = document.createElement('button');
    button.innerText = '-';
    button.className = "btn btn-danger btn-sm col-auto";
    button.type = 'button';
    button.setAttribute('onclick', `deleteTutor('${divSelect.id}')`);
    divSelect.appendChild(button);
    _appendSelect(workers);
}

function addEditTutorSelect() {
    const divBlock = document.getElementById('edit-tutorContainer');
    var divEditSelect = document.createElement('div');
    divEditSelect.id = 'divEditSelect_' + ++editNumSelect;
    divEditSelect.className = 'col';
    divBlock.appendChild(divEditSelect);

    var select = document.createElement('select');
    select.id = 'edit-tutor_' + editNumSelect;
    select.className = 'col-8';
    divEditSelect.appendChild(select);

    const button = document.createElement('button');
    button.innerText = '-';
    button.className = "btn btn-danger btn-sm col-auto";
    button.type = 'button';
    button.setAttribute('onclick', `deleteEditTutor('${divEditSelect.id}')`);
    divEditSelect.appendChild(button);
    _appendNewEditSelect(workersArray);
}

function deleteTutor(id) {
    const divBlock = document.getElementById('tutorContainer');
    var divSelect = document.getElementById(id);
    divBlock.removeChild(divSelect);
}

function deleteEditTutor(id) {
    const divBlock = document.getElementById('edit-tutorContainer');
    var divSelect = document.getElementById(id);
    divBlock.removeChild(divSelect);
}

function _displayProjects(data) {
    const tBody = document.getElementById('projectsList');
    tBody.innerHTML = '';

    const button = document.createElement('button');

    if (data.length == 0) {
        alert("Запрашиваемый список проектов пуст!");
        return;
    }

    data.forEach(project => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Редактировать';
        editButton.className = "btn btn-primary";
        editButton.setAttribute('onclick', `updateEditForm(${project.id})`);
        editButton.setAttribute('data-bs-toggle', `modal`);
        editButton.setAttribute('data-bs-target', `#editModal`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Удалить';
        deleteButton.className = "btn btn-danger";
        deleteButton.setAttribute('onclick', `deleteProject(${project.id})`);

        let tr = tBody.insertRow();

        let td1 = tr.insertCell(0);
        let textNode1 = document.createTextNode(project.id);
        td1.appendChild(textNode1);

        let td2 = tr.insertCell(1);
        let textNode2 = document.createTextNode(project.title);
        td2.appendChild(textNode2);

        let td3 = tr.insertCell(2);
        if (project.description == null) {
            let textNode3 = document.createTextNode('---');
            td3.appendChild(textNode3);
        } else {
            let textNode3 = document.createTextNode(project.description);
            td3.appendChild(textNode3);
        }


        let td4 = tr.insertCell(3);
        if (project.workers.length == 0) {
            let textNode4 = document.createTextNode('---');
            td4.appendChild(textNode4);
        } else {
            workers = '';
            project.workers.forEach(worker => {
                workers += worker.name + ' ' + worker.sename + ' (' + worker.position + "). ";
            });
            let textNode4 = document.createTextNode(workers);
            td4.appendChild(textNode4);
        }

        let td5 = tr.insertCell(4);
        td5.appendChild(editButton);

        let td6 = tr.insertCell(5);
        td6.appendChild(deleteButton);
    });

    projects = data;

}