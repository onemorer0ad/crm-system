(async () => {
  let clientList = document.getElementById("client-list");
  let clients = [];
  let clientInfo = [];
  clients = await getClientListItem();
  renderClientList(clients);

  async function getClientListItem() {
    try {
      const response = await fetch("http://localhost:3000/api/clients");
      if (!response.ok) {
        let container = document.querySelector(".table__container");
        let clientListItem = document.createElement("div");
        clientListItem.textContent = "Не удалось получить список клиентов";
        clientListItem.classList.add("text-center", "mt-3", "font-weight-bold");
        container.appendChild(clientListItem);
      }
      let clientListItem = await response.json();
      return clientListItem;
    } catch (error) {
      console.log(error);
    }
  }

  function formatDate(inputDate) {
    const dateObject = new Date(inputDate);
    const day = String(dateObject.getDate()).padStart(2, "0");
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const year = dateObject.getFullYear();
    const hour = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");
    const formattedDate = `${day}.${month}.${year} <span class="txt-grey">${hour}:${minutes}</span>`;
    return formattedDate;
  }

  function getClientItem(client) {
    let newRow = document.createElement("tr");

    let createdAt = formatDate(client.createdAt);
    let updatedAt = formatDate(client.updatedAt);

    let contacts = client.contacts;
    // Создаем пустую строку для хранения ячеек контактов
    let contactsHTML = "";

    // Итерируем по массиву contacts и создаем строку для каждого объекта
    contacts.forEach((contact) => {
      if (contact.type == "Телефон") {
        contactsHTML +=
          '<a class="htooltip" href="tel:' +
          contact.value +
          `"><img src="./img/phone.svg" alt=""><span>${contact.value}</span></a>`;
      }
      if (contact.type == "Email") {
        contactsHTML +=
          '<a class="htooltip" href="mailto:' +
          contact.value +
          `"><img src="./img/mail.svg" alt=""><span>${contact.value}</span></a>`;
      }
      if (contact.type == "Facebook") {
        contactsHTML +=
          '<a class="htooltip" target="_blank" href="' +
          contact.value +
          `"><img src="./img/fb.svg" alt=""><span>${contact.value}</span></a>`;
      }
      if (contact.type == "Vk".toUpperCase()) {
        contactsHTML +=
          '<a class="htooltip" target="_blank" href="' +
          contact.value +
          `"><img src="./img/vk.svg" alt=""><span>${contact.value}</span></a>`;
      }
    });

    newRow.innerHTML =
      "<td class='txt-grey padding-left'>" +
      client.id +
      "</td><td>" +
      client.surname +
      " " +
      client.name +
      " " +
      client.lastName +
      "</td><td>" +
      createdAt +
      "</td><td>" +
      updatedAt +
      "</td><td>" +
      contactsHTML;
    ("</td>");

    // Создаем элемент <img> для SVG
    let editSvgElement = document.createElement("img");
    editSvgElement.src = "./img/edit.svg"; // Указываем путь к вашему SVG-файлу
    editSvgElement.alt = "Edit Icon"; // Устанавливаем альтернативный текст для SVG

    let deleteSvgElement = document.createElement("img");
    deleteSvgElement.src = "./img/delete.svg"; // Указываем путь к вашему SVG-файлу
    deleteSvgElement.alt = "Edit Icon"; // Устанавливаем альтернативный текст для SVG

    // Создаем кнопку "Изменить"
    const editBtn = document.createElement("button");
    editBtn.innerText = "Изменить";

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Удалить";

    // Обертываем кнопку в ссылку
    let editLink = document.createElement("a");
    editLink.href = "#";
    editLink.classList.add("edit-link");
    editBtn.classList.add("edit-btn");

    let deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.classList.add("delete-link");
    deleteButton.classList.add("delete-btn", "btn-padding-reset");

    let editContainer = document.createElement("td");
    editContainer.classList.add(
      "d-flex",
      "align-items-center",
      "flex-column-custom"
    );
    editContainer.appendChild(editLink);
    editContainer.appendChild(deleteLink);
    editLink.appendChild(editSvgElement);
    editLink.appendChild(editBtn);

    deleteLink.appendChild(deleteSvgElement);
    deleteLink.appendChild(deleteButton);

    newRow.appendChild(editContainer);
    clientInfo.push(client);
    return newRow;
  }

  async function deleteClientById(id, modal, isModalOpen) {
    try {
      let delElement = document.querySelector(".delete__form");
      let editDelElement = document.querySelector(".edit__form");
      editDelElement.querySelectorAll(".text-danger").forEach((el) => {
        el.remove();
      });
      delElement.querySelectorAll(".text-danger").forEach((el) => {
        el.remove();
      });

      const response = await fetch(`http://localhost:3000/api/clients/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let delDiv = document.createElement("div");
        let editDiv = document.createElement("div");

        delDiv.textContent = "Не удалось удалить клиента";
        editDiv.textContent = "Не удалось удалить клиента";

        delDiv.classList.add("text-danger");
        editDiv.classList.add("text-danger");

        delElement.appendChild(delDiv);
        editDelElement.appendChild(editDiv);
      } else {
        modal.close();
        isModalOpen = false;
        clients = await getClientListItem();
        renderClientList(clients);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function renderClientList(clients) {
    clientList.innerHTML = "";
    for (let client of clients) {
      clientList.appendChild(getClientItem(client));
    }
  }

  const formInputs = {
    name: document.querySelector('[data-sort="name"]'),
    surname: document.querySelector('[data-sort="surname"]'),
    lastname: document.querySelector('[data-sort="lastName"]'),
  };

  let isFormValid = true;
  // валидация если пустые то добавляем класс инвалид
  function validateForm(form) {
    const inputs = form.querySelectorAll("input");
    let isValid = true;
    inputs.forEach((element) => {
      element.classList.remove("is-invalid");
      const errorEl = element.nextElementSibling;
      if (errorEl && errorEl.classList.contains("error-message")) {
        errorEl.remove();
      }

      if (!element.value.trim().length) {
        element.classList.add("is-invalid");
        element.insertAdjacentHTML(
          "afterend",
          `<span class="error-message">Введите ${element.placeholder}</span>`
        );
        isValid = false;
      } else {
        const errorEl = element.nextElementSibling;
        if (errorEl && errorEl.classList.contains("error-message")) {
          errorEl.remove();
        }
      }
    });
    isFormValid = isValid;
    return isValid;
  }

  let addForm = document.getElementById("client-form");

  const inputFields = addForm.querySelectorAll("input");
  inputFields.forEach((input) => {
    input.addEventListener("input", function () {
      if (!isFormValid) {
        validateForm(addForm);
      }
    });
  });

  // получить массив formData в нужном формате
  function getFormData() {
    const formData = {
      name: formInputs.name.value.trim(),
      surname: formInputs.surname.value.trim(),
      lastName: formInputs.lastname.value.trim(),
    };
    return formData;
  }

  function createSortFunction() {
    let lastSorted = {
      property: "id",
      ascending: true,
    };

    return function (property) {
      const newData = JSON.parse(JSON.stringify(clients));
      newData.forEach((client) => {
        client.fio = `${client.surname} ${client.name}  ${client.middleName}`;
      });

      if (lastSorted.property === property) {
        // Если текущее свойство совпадает с предыдущим, меняем порядок сортировки
        newData.reverse();

        lastSorted.ascending = !lastSorted.ascending;
      } else {
        // Если текущее свойство отличается от предыдущего, сортируем по новому свойству
        newData.sort((a, b) => {
          if (a[property] > b[property]) {
            return 1;
          } else if (a[property] < b[property]) {
            return -1;
          } else {
            return 0;
          }
        });
        lastSorted.property = property;
        lastSorted.ascending = true;
        const sortElements = document.querySelectorAll(".sort");
        sortElements.forEach((el) => {
          el.classList.remove("active__sort");
          el.querySelector("img").src = "./img/arrowDown.svg";
        });
        const sortElement = document.querySelector(`[data-sort="${property}"]`);
        sortElement.classList.add("active__sort");
        sortElement.querySelector("img").src = "./img/arrowUp.svg";
      }

      return { data: newData, lastSorted };
    };
  }

  const sortFunction = createSortFunction();

  const sort = document.querySelectorAll(".sort");
  sort.forEach((el) => {
    el.addEventListener("click", function (evt) {
      const { data, lastSorted } = sortFunction(el.dataset.sort);
      renderClientList(data);
    });
  });

  const filterInput = document.querySelector(".filter_input");
  let timerId = null;

  filterInput.addEventListener("input", function (e) {
    clearTimeout(timerId);
    const inputValue = e.target.value;
    timerId = setTimeout(() => {
      async function getFilteredClients() {
        try {
          const response = await fetch(
            `http://localhost:3000/api/clients?search=${inputValue}`
          );
          const data = await response.json();
          return data;
        } catch (error) {
          console.log(error);
        }
      }

      getFilteredClients().then((data) => {
        renderClientList(data);
      });
    }, 300);
  });

  // листенеры для добавления, удаления и изменения
  const showModalBtn = document.getElementById("show-modal-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const editButtons = document.querySelectorAll(".edit-btn");

  showModalBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal("add");
  });

  deleteButtons.forEach((deleteButton) => {
    deleteButton.addEventListener("click", (e) => {
      e.stopPropagation();
      let parentElement = event.target.parentNode.parentNode.parentNode;
      let id = parentElement.firstElementChild.textContent;
      openModal("delete", id);
    });
  });

  editButtons.forEach((editButton) => {
    editButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      let parentElement = event.target.parentNode.parentNode.parentNode;
      let id = parentElement.firstElementChild.textContent;

      async function getData(id) {
        const response = await fetch(`http://localhost:3000/api/clients/${id}`);
        const data = await response.json();
        return data;
      }

      const clientInfo = await getData(id);

      openModal("edit", clientInfo);
    });
  });

  // функция создания меню контактов
  function createContactMenu(modalType) {
    let contactMenu = document.createElement("div");
    contactMenu.classList.add("mb-4", "select-group");

    let select = document.createElement("select");
    select.classList.add(`${modalType}-method`, "options-group");
    select.innerHTML = `
    <option value="Телефон">Телефон</option>
    <option value="Email">Email</option>
    <option value="VK">ВКонтакте</option>
    <option value="Facebook">Facebook</option>
    `;

    let input = document.createElement("input");
    input.classList.add(`${modalType}-input`, "form__input");
    input.type = "text";
    input.placeholder = "Данные контакта";

    let svgImage = document.createElement("img");
    let buttonElement = document.createElement("button");
    let spanElement = document.createElement("span");
    spanElement.textContent = "Удалить контакт";
    buttonElement.appendChild(svgImage);
    buttonElement.appendChild(spanElement);
    buttonElement.classList.add("btn-reset", "delete-contact-btn", "htooltip");
    svgImage.setAttribute("src", "img/cancel.svg");
    svgImage.setAttribute("alt", "Cancel");
    svgImage.classList.add("svg-image");

    let formGroup = document.createElement("div");
    formGroup.classList.add("form-group");
    formGroup.appendChild(input);

    contactMenu.appendChild(select);
    contactMenu.appendChild(formGroup);
    contactMenu.appendChild(buttonElement);

    return contactMenu;
  }

  // логика открытия закрытия и сохранения модалки для добавления клиента
  function openModal(operationType, client = null) {
    if (operationType == "add") {
      const modal = document.getElementById("add-dialog");
      const modalBox = document.getElementById("modal-box");
      const closeModalBtn = document.getElementById("close-modal-btn");
      const closeModalSvg = document.getElementById("add-close");
      const addContactButton = document.getElementById("add-contact");
      const selectForm = document.getElementById("contact-list");
      const contactList = document.getElementById("add-contact-list");
      let addForm = document.getElementById("client-form");

      let isModalOpen = false;

      modal.showModal();
      isModalOpen = true;

      // добавить контакт
      function addContactButtonClickHandler(event) {
        event.preventDefault();
        event.stopPropagation();

        let contactsCount =
          contactList.querySelectorAll(".select-group").length;
        if (contactsCount < 10) {
          let contactMenu = createContactMenu("add");
          selectForm.classList.add("select__form-added");
          contactList.appendChild(contactMenu);
        } else {
          addContactButton.removeEventListener(
            "click",
            addContactButtonClickHandler
          );
          addContactButton.parentNode.removeChild(addContactButton);
        }
      }

      if (addContactButton) {
        addContactButton.addEventListener(
          "click",
          addContactButtonClickHandler
        );
      }

      // сохранение
      addForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        let contactsInfo = [];

        // считываем значения с  селектов
        let selectElements = document.querySelectorAll(".add-method");
        let selectedElementsArray = Array.from(selectElements);
        selectedElementsArray.forEach((el) => {
          let correspondingInput = el
            .closest(".select-group")
            .querySelector(".form__input");
          contactsInfo.push({
            type: el.value,
            value: correspondingInput.value,
          });
        });

        // валидация если пустые то добавляем класс инвалид
        validateForm(addForm);

        // если есть где то класс инвалид то возвращаем false (прерываем функцию)
        if (addForm.querySelectorAll(".is-invalid").length) {
          return false;
        }

        // записываем массив formData в переменную formData
        const formData = getFormData();
        formData.contacts = contactsInfo;
        // записываем данные с контактами

        try {
          const response = await fetch("http://localhost:3000/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          if (response.status !== 201) {
            let container = document.querySelector(".add__form");
            let clientListItem = document.createElement("div");
            clientListItem.textContent = "Не удалось добавить клиента";
            clientListItem.classList.add(
              "text-center",
              "mt-3",
              "font-weight-bold"
            );
            container.appendChild(clientListItem);
          } else {
            clients = await getClientListItem();
            renderClientList(clients);
            modal.close();
            isModalOpen = false;
          }
        } catch (error) {
          console.log(error);
        }

        form.reset();
      });

      // закрытие

      closeModalSvg.addEventListener("click", () => {
        modal.close();
        isModalOpen = false;
      });

      closeModalBtn.addEventListener("click", () => {
        modal.close();
        isModalOpen = false;
      });

      document.addEventListener("click", (e) => {
        if (isModalOpen && !modalBox.contains(e.target)) {
          modal.close();
        }
      });
    }
    if (operationType == "delete" && client !== null) {
      const modal = document.getElementById("delete-dialog");
      const modalBox = document.getElementById("delete-box");
      const closeModalBtn = document.getElementById("close-delete-modal-btn");
      const closeModalSvg = document.getElementById("delete-close");

      let isModalOpen = false;

      modal.showModal();
      isModalOpen = true;

      // удаление
      const confirmDeleteButton = document.getElementById("delete-client-btn");
      confirmDeleteButton.addEventListener("click", function (event) {
        event.preventDefault();
        deleteClientById(client, modal, isModalOpen);
      });

      // закрытие

      closeModalSvg.addEventListener("click", () => {
        modal.close();
        isModalOpen = false;
      });

      closeModalBtn.addEventListener("click", () => {
        modal.close();
        isModalOpen = false;
      });

      document.addEventListener("click", (e) => {
        if (isModalOpen && !modalBox.contains(e.target)) {
          modal.close();
        }
      });
    }
    if (operationType == "edit" && client !== null) {
      const modal = document.getElementById("edit-dialog");
      const modalBox = document.getElementById("edit-box");
      const closeModalBtn = document.getElementById("edit-close");
      const saveBtn = document.getElementById("save-btn");

      let isModalOpen = false;

      modal.showModal();
      isModalOpen = true;

      // создание динамических данных
      let nameElement = document.getElementById("name");
      let surnameElement = document.getElementById("surname");
      let lastNameElement = document.getElementById("lastname");
      let addContactButton = document.getElementById("edit-add-contact");
      let editId = document.getElementById("edit-id");
      let contactList = document.getElementById("contact-list");
      let selectForm = document.getElementsByClassName("select__form")[0];

      editId.textContent = `ID: ${client.id} `;

      let firstPElement = document.createElement("input");
      firstPElement.classList.add("form-control", "form__bold");
      firstPElement.value = client.name;

      let secondPElement = document.createElement("input");
      secondPElement.classList.add("form-control", "form__bold");
      secondPElement.value = client.surname;

      let thirdPElement = document.createElement("input");
      thirdPElement.classList.add("form-control", "form__bold");
      thirdPElement.value = client.lastName;

      let contactHtmlELement = client.contacts.map((contact) => {
        return contact.value;
      });

      nameElement.appendChild(firstPElement);
      surnameElement.appendChild(secondPElement);
      lastNameElement.appendChild(thirdPElement);

      // логика считывания контакта

      if (contactHtmlELement.length > 0) {
        contactHtmlELement.forEach((contact) => {
          let contactMenu = createContactMenu("edit");
          contactList.appendChild(contactMenu);
          let inputs = contactMenu.querySelectorAll(".form__input");
          let selects = contactMenu.querySelectorAll(".options-group");

          selects.forEach((select) => {
            if (contact.startsWith("+7")) {
              select.value = "Телефон";
            } else if (
              contact.startsWith("https://vk.com/") ||
              contact.startsWith("https://www.vk.com/")
            ) {
              select.value = "VK";
            } else if (
              contact.startsWith("https://www.facebook.com/") ||
              contact.startsWith("https://facebook.com/")
            ) {
              select.value = "Facebook";
            } else {
              select.value = "Email";
            }
          });

          selectForm.classList.add("select__form-added");

          inputs.forEach((input) => {
            input.value = contact;
          });
        });
      }

      // добавление контакта

      if (client.contacts.length == 10) {
        addContactButton.style.display = "none";
      } else {
        addContactButton.style.display = "block";
        addContactButton.addEventListener(
          "click",
          addContactButtonClickHandler
        );
      }

      function addContactButtonClickHandler(event) {
        event.preventDefault();

        let contactsCount =
          contactList.querySelectorAll(".select-group").length;
        if (contactsCount < 10) {
          let contactMenu = createContactMenu("edit");
          selectForm.classList.add("select__form-added");
          contactList.appendChild(contactMenu);
        } else {
          addContactButton.removeEventListener(
            "click",
            addContactButtonClickHandler
          );
          addContactButton.parentNode.removeChild(addContactButton);
        }
      }

      // удаление контакта

      let nodeListCancelBtns = document.querySelectorAll(".delete-contact-btn");
      let arrOfCancelBtns = [...nodeListCancelBtns];

      arrOfCancelBtns.forEach((cancelBtn) => {
        cancelBtn.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          let contactDiv = cancelBtn.parentNode;
          contactDiv.remove();
        });
      });

      // сохранить
      saveBtn.addEventListener("click", async function (event) {
        event.preventDefault();

        let contactsInfo = [];

        // считываем значения с  селектов
        let selectElements = document.querySelectorAll(".edit-method");
        let selectedElementsArray = Array.from(selectElements);
        selectedElementsArray.forEach((el) => {
          let correspondingInput = el
            .closest(".select-group")
            .querySelector(".form__input");
          contactsInfo.push({
            type: el.value,
            value: correspondingInput.value,
          });
        });

        let editForm = document.getElementById("edit-form");

        // валидация если пустые то добавляем класс инвалид
        validateForm(editForm);

        // если есть где то класс инвалид то возвращаем false (прерываем функцию)
        if (editForm.querySelectorAll(".is-invalid").length) {
          return false;
        }

        let formdata = {
          name: firstPElement.value,
          surname: secondPElement.value,
          lastName: thirdPElement.value,
          contacts: contactsInfo,
        };

        try {
          let container = document.querySelector(".edit__form");
          container.querySelectorAll(".text-center").forEach((el) => {
            el.remove();
          });

          const response = await fetch(
            `http://localhost:3000/api/clients/${client.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formdata),
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            clients = await getClientListItem();
            renderClientList(clients);

            modal.close();
            isModalOpen = false;
            nameElement.removeChild(firstPElement);
            surnameElement.removeChild(secondPElement);
            lastNameElement.removeChild(thirdPElement);
            while (contactList.firstChild) {
              contactList.removeChild(contactList.firstChild);
            }
          } else {
            let clientListItem = document.createElement("div");
            clientListItem.textContent = "Не удалось обновить данные";
            clientListItem.classList.add(
              "text-center",
              "mt-3",
              "font-weight-bold"
            );
            container.appendChild(clientListItem);
          }
        } catch (error) {
          console.log(error);
        }
      });

      // удаление
      const confirmDeleteButton = document.getElementById("delete-btn");
      confirmDeleteButton.addEventListener("click", function (event) {
        event.preventDefault();
        deleteClientById(client.id, modal, isModalOpen);

        // modal.close();
        // isModalOpen = false;
        // nameElement.removeChild(firstPElement);
        // surnameElement.removeChild(secondPElement);
        // lastNameElement.removeChild(thirdPElement);
        // while (contactList.firstChild) {
        //   contactList.removeChild(contactList.firstChild);
        // }
      });
      // закрытие

      closeModalBtn.addEventListener("click", () => {
        modal.close();
        isModalOpen = false;
        nameElement.removeChild(firstPElement);
        surnameElement.removeChild(secondPElement);
        lastNameElement.removeChild(thirdPElement);
        while (contactList.firstChild) {
          contactList.removeChild(contactList.firstChild);
        }
      });

      document.addEventListener("click", (e) => {
        if (isModalOpen && !modalBox.contains(e.target)) {
          modal.close();
          nameElement.removeChild(firstPElement);
          surnameElement.removeChild(secondPElement);
          lastNameElement.removeChild(thirdPElement);
          while (contactList.firstChild) {
            contactList.removeChild(contactList.firstChild);
          }
        }
      });
    }
  }
})();
