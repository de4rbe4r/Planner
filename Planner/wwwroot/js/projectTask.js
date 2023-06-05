const uriWorkers = '/api/workers';
const uriProjects = '/api/projects';
const uriProjectTasks = '/api/projecttasks';
workersArray = [];
projects = [];
projectTasks = [];
numSelect = 1;
editNumSelect = 1;

function getWorkers() {
    fetch(uriWorkers)
        .then(response => response.json())
        .then(data => {
            workersArray = data;
        })
        .catch(error => alert('Ошибка при получении списка работников. ' + error));
}


function getWorkersArray() {
    fetch(uriWorkers)
        .then(response => response.json())
        .then(data => {
            workersArray = data
            _appendSelect(workersArray);
        })
        .catch(error => alert('Ошибка при получении списка работников. ' + error));
}

function getProjects() {
    fetch(uriProjects)
        .then(response => response.json())
        .then(data => {
            _appendProjectSelect(data);
            getProjectTasks();
        })
        .catch(error => alert('Ошибка при получении списка проектов. ' + error));
}

function getProjectTasks() {
    const select = document.getElementById('projectSelect');
    if (select.selectedIndex == -1) return;
    var projectId = select.options[select.selectedIndex].value;
    fetch(uriProjectTasks + '/byProjectId/' + projectId)
        .then(response => response.json())
        .then(data => {
            _displayProjectTasks(data);
        })
        .catch(error => alert('Ошибка при получении списка задач. ' + error));
}

function findProjectTask() {
    const title = document.getElementById('title').value;

    fetch(uriProjectTasks + "/find/" + title)
        .then(response => response.json())
        .then(data => _displayProjectTasks(data))
        .catch(error => alert('Ошибка при получении списка задач. ' + error));
}

function addProjectTask() {
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const select = document.getElementById('projectSelect');
    var projectId = select.options[select.selectedIndex].value;
    workersList = [];

    for (i = 1; i <= numSelect; i++) {
        var selectTutor = document.getElementById('tutor_' + i);
        workersArray.forEach(w => {
            if (w.id == (selectTutor.options[selectTutor.selectedIndex].value))
                workersList.push(w);
        });
    }

    const projectTask = {
        title: title.value,
        description: description.value,
        workers: workersList,
        projectId: projectId
    };

    fetch(uriProjectTasks, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectTask)
    })
        .then(response => response.json())
        .then((data) => {
            if (data.detail == undefined) {
                alert("Задача " + data.title + ' успешно создана!');
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
            getProjectTasks();
        })
        .catch(error => alert('Ошибка при создании задачи. ' + error));
}

function updateEditForm(id) {
    const projectTask = projectTasks.find(p => p.id == id);

    document.getElementById('edit-id').value = projectTask.id;
    document.getElementById('edit-title').value = projectTask.title;
    document.getElementById('edit-description').value = projectTask.description;

    _appendEditSelect(projectTask);
}

function updateProjectTask() {
    const projectTaskId = document.getElementById('edit-id').value;

    workersList = [];

    for (i = 1; i <= editNumSelect; i++) {
        var select = document.getElementById('edit-tutor_' + i);
        if (select == null) continue;
        workersArray.forEach(w => {
            if (w.id == (select.options[select.selectedIndex].value))
                workersList.push(w);
        });
    }

    const projectTask = {
        id: parseInt(projectTaskId, 10),
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        workers: workersList
    };
    fetch(`${uriProjectTasks}/${projectTaskId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectTask)
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "ProjectTasksList.html") getProjectTasks();
            else if (page[page.length - 1] == "FindProjectTask.html") findProjectTask();
        })
        .catch(error => alert('Ошибка при редактировании задачи. ' + error));
    document.getElementById('btnCloseModal').click();
}

function setCompletedProjectTask(id) {
    const projectTask = projectTasks.find(p => p.id == id);
    const checkbox = document.getElementById('checkbox_' + id);
    projectTask.isCompleted = checkbox.checked;
    console.log(projectTask.isCompleted);

    fetch(`${uriProjectTasks}/${id}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectTask)
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "ProjectTasksList.html") getProjectTasks();
            else if (page[page.length - 1] == "FindProjectTask.html") findProjectTask();
        })
        .catch(error => alert('Ошибка при изменения состояния задачи. ' + error));
    console.log(projectTask.isCompleted);

}

function deleteProjectTask(id) {
    fetch(`${uriProjectTasks}/${id}`, {
        method: 'DELETE'
    })
        .then(() => {
            const page = window.location.href.split('/');
            if (page[page.length - 1] == "ProjectTasksList.html") getProjectTasks();
            else if (page[page.length - 1] == "FindProjectTask.html") findProjectTask();
        })
        .catch(error => alert('Ошибка при удалении задачи. ' + error));
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
}

function _appendProjectSelect(data) {
    const select = document.getElementById('projectSelect');

    if (data.length == 0) {
        alert("Запрашиваемый список проектов пуст!");
        return;
    }

    data.forEach(project => {
        var opt = document.createElement('option');
        opt.value = project.id;
        opt.innerHTML = project.title;
        select.appendChild(opt);
    });

    projects = data;
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
    _appendSelect(workersArray);
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

function _displayProjectTasks(data) {
    const tBody = document.getElementById('projectTasksList');
    tBody.innerHTML = '';

    const button = document.createElement('button');
    if (data == undefined || data.length == 0) {
       alert('Список задач проекта пуст!');
        return;
    }

    // Сортировка
    data.sort((a,b) => (a.isCompleted  > b.isCompleted ) ? 1 : ((b.isCompleted  > a.isCompleted ) ? -1 : 0));

    data.forEach(projectTask => {
        let editButton = button.cloneNode(false);
        editButton.innerText = 'Редактировать';
        editButton.className = "btn btn-primary";
        editButton.setAttribute('onclick', `updateEditForm(${projectTask.id})`);
        editButton.setAttribute('data-bs-toggle', `modal`);
        editButton.setAttribute('data-bs-target', `#editModal`);

        let deleteButton = button.cloneNode(false);
        deleteButton.innerText = 'Удалить';
        deleteButton.className = "btn btn-danger";
        deleteButton.setAttribute('onclick', `deleteProjectTask(${projectTask.id})`);
        let tr = tBody.insertRow();


        let td1 = tr.insertCell(0);
        let textNode1 = document.createTextNode(projectTask.id);
        td1.appendChild(textNode1);

        let td2 = tr.insertCell(1);
        let textNode2 = document.createTextNode(projectTask.title);
        td2.appendChild(textNode2);

        let td3 = tr.insertCell(2);
        if (projectTask.description == null) {
            let textNode3 = document.createTextNode('---');
            td3.appendChild(textNode3);
        } else {
            let textNode3 = document.createTextNode(projectTask.description);
            td3.appendChild(textNode3);
        }

        let td4 = tr.insertCell(3);
        let textNode4 = document.createTextNode(projectTask.createdDate.split('T')[0]);
        td4.appendChild(textNode4);

        let td5 = tr.insertCell(4);
        if (projectTask.workers.length == 0) {
            let textNode5 = document.createTextNode('---');
            td5.appendChild(textNode5);
        } else {
            workers = '';
            projectTask.workers.forEach(worker => {
                workers += worker.name + ' ' + worker.sename + ' (' + worker.position + "). ";
            });
            let textNode5 = document.createTextNode(workers);
            td5.appendChild(textNode5);
        }
        let td6 = tr.insertCell(5);
        var check = document.createElement('input');
        check.setAttribute('type', 'checkbox');
        check.setAttribute('id', 'checkbox_' + projectTask.id );
        check.setAttribute('onclick', `setCompletedProjectTask('${projectTask.id}')`);
        if (projectTask.isCompleted) {
            tr.setAttribute('class', 'table-secondary');
            check.setAttribute('checked', 'true');
        }

        td6.appendChild(check);

        let td7 = tr.insertCell(6);
        td7.appendChild(editButton);

        let td8 = tr.insertCell(7);
        td8.appendChild(deleteButton);
    });
    projectTasks = data;
}