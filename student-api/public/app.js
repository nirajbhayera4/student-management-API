const form = document.querySelector("#studentForm");
const formTitle = document.querySelector("#formTitle");
const submitButton = document.querySelector("#submitButton");
const resetButton = document.querySelector("#resetButton");
const refreshButton = document.querySelector("#refreshButton");
const cityFilter = document.querySelector("#cityFilter");
const messageBox = document.querySelector("#messageBox");
const studentsTable = document.querySelector("#studentsTable");
const emptyState = document.querySelector("#emptyState");
const studentCount = document.querySelector("#studentCount");
const apiState = document.querySelector("#apiState");
const dbState = document.querySelector("#dbState");

const fields = {
  id: document.querySelector("#studentId"),
  name: document.querySelector("#name"),
  age: document.querySelector("#age"),
  email: document.querySelector("#email"),
  city: document.querySelector("#city"),
};

let students = [];

function setMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`.trim();
}

function setLoading(isLoading) {
  if (isLoading) {
    apiState.textContent = "Loading";
  }

  submitButton.disabled = isLoading;
  refreshButton.disabled = isLoading;
}

function setReady() {
  apiState.textContent = "Ready";
}

function getPayload() {
  return {
    name: fields.name.value.trim(),
    age: Number(fields.age.value),
    email: fields.email.value.trim(),
    city: fields.city.value.trim(),
  };
}

function resetForm() {
  form.reset();
  fields.id.value = "";
  formTitle.textContent = "Add Student";
  submitButton.textContent = "Save Student";
  setMessage("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderStudents() {
  studentCount.textContent = students.length;
  emptyState.hidden = students.length > 0;

  studentsTable.innerHTML = students
    .map((student) => {
      const id = escapeHtml(student._id);
      const name = escapeHtml(student.name);
      const age = escapeHtml(student.age);
      const email = escapeHtml(student.email);
      const city = escapeHtml(student.city);

      return `
        <tr>
          <td>
            <strong>${name}</strong>
            <span class="student-id">Created ${formatDate(student.createdAt)}</span>
          </td>
          <td>${age}</td>
          <td>${email}</td>
          <td>${city}</td>
          <td>
            <div class="actions">
              <button class="row-button" type="button" data-action="edit" data-id="${id}">Edit</button>
              <button class="row-button danger" type="button" data-action="delete" data-id="${id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function readError(response) {
  const data = await response.json().catch(() => ({}));

  if (Array.isArray(data.errors)) {
    return data.errors.join(", ");
  }

  return data.message || "Something went wrong";
}

async function loadStudents() {
  setLoading(true);

  try {
    const city = cityFilter.value.trim();
    const query = city ? `?city=${encodeURIComponent(city)}` : "";
    const response = await fetch(`/students${query}`);

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    students = await response.json();
    renderStudents();
    setReady();
    setMessage(city ? `Showing students from ${city}` : "Student list refreshed", "success");
  } catch (error) {
    apiState.textContent = "Error";
    setMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function checkStatus() {
  try {
    const response = await fetch("/api/status");

    if (!response.ok) {
      throw new Error("Backend offline");
    }

    const status = await response.json();
    apiState.textContent = "Ready";
    dbState.textContent = status.database === "connected" ? "Connected" : "Offline";
  } catch (error) {
    apiState.textContent = "Offline";
    dbState.textContent = "Offline";
    setMessage("Backend or database is not connected", "error");
  }
}

async function saveStudent(event) {
  event.preventDefault();
  setLoading(true);

  const id = fields.id.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `/students/${id}` : "/students";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(getPayload()),
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    resetForm();
    await loadStudents();
    setMessage(id ? "Student updated" : "Student added", "success");
  } catch (error) {
    apiState.textContent = "Error";
    setMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function deleteStudent(id) {
  setLoading(true);

  try {
    const response = await fetch(`/students/${id}`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    if (fields.id.value === id) {
      resetForm();
    }

    await loadStudents();
    setMessage("Student deleted", "success");
  } catch (error) {
    apiState.textContent = "Error";
    setMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function editStudent(id) {
  const student = students.find((item) => item._id === id);

  if (!student) {
    return;
  }

  fields.id.value = student._id;
  fields.name.value = student.name || "";
  fields.age.value = student.age || "";
  fields.email.value = student.email || "";
  fields.city.value = student.city || "";
  formTitle.textContent = "Update Student";
  submitButton.textContent = "Update Student";
  setMessage(`Editing ${student.name}`, "success");
  fields.name.focus();
}

studentsTable.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  if (button.dataset.action === "edit") {
    editStudent(button.dataset.id);
  }

  if (button.dataset.action === "delete") {
    deleteStudent(button.dataset.id);
  }
});

form.addEventListener("submit", saveStudent);
resetButton.addEventListener("click", resetForm);
refreshButton.addEventListener("click", loadStudents);
cityFilter.addEventListener("input", () => {
  window.clearTimeout(cityFilter.searchTimer);
  cityFilter.searchTimer = window.setTimeout(loadStudents, 300);
});

checkStatus().then(loadStudents);
