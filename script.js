const form = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const totalStudents = document.getElementById("totalStudents");
const searchInput = document.getElementById("search");
const emptyMessage = document.getElementById("emptyMessage");

let students = JSON.parse(
    localStorage.getItem("students") || "[]"
);

let editingId = null;

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.roll.toLowerCase().includes(query)
    );

    studentList.replaceChildren();
    totalStudents.textContent = students.length;
    emptyMessage.hidden = filteredStudents.length > 0;

    filteredStudents.forEach(student => {
        const row = document.createElement("tr");

        [student.name, student.roll, student.course, student.email]
            .forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.type = "button";
        editButton.addEventListener("click", () => {
            document.getElementById("name").value = student.name;
            document.getElementById("roll").value = student.roll;
            document.getElementById("course").value = student.course;
            document.getElementById("email").value = student.email;

            editingId = student.id;
            form.querySelector("button[type='submit']").textContent =
                "Update Student";

            document.getElementById("name").focus();
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.addEventListener("click", () => {
            if (!confirm("Delete this student?")) return;

            students = students.filter(item => item.id !== student.id);

            if (editingId === student.id) {
                editingId = null;
                form.reset();
                form.querySelector("button[type='submit']")
                    .textContent = "Add Student";
            }

            saveStudents();
            renderStudents();
        });

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);
        studentList.appendChild(row);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const student = {
        id: editingId ?? (
            window.crypto.randomUUID
                ? window.crypto.randomUUID()
                : String(Date.now())
        ),
        name: document.getElementById("name").value.trim(),
        roll: document.getElementById("roll").value.trim(),
        course: document.getElementById("course").value.trim(),
        email: document.getElementById("email").value.trim()
    };

    if (students.some(item =>
        item.roll.toLowerCase() === student.roll.toLowerCase() &&
        item.id !== editingId
    )) {
        alert("This roll number already exists!");
        return;
    }

    if (editingId !== null) {
        students = students.map(item =>
            item.id === editingId ? student : item
        );
    } else {
        students.push(student);
    }

    editingId = null;
    saveStudents();
    form.reset();

    form.querySelector("button[type='submit']")
        .textContent = "Add Student";

    renderStudents();
});

searchInput.addEventListener("input", renderStudents);

renderStudents();
const attendanceDate = document.getElementById("attendanceDate");
const attendanceList = document.getElementById("attendanceList");
const presentToday = document.getElementById("presentToday");
const absentToday = document.getElementById("absentToday");
const saveAttendanceButton = document.getElementById("saveAttendance");
const attendanceMessage = document.getElementById("attendanceMessage");

const today = new Date();
const localToday =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

attendanceDate.value = localToday;

let attendanceRecords = JSON.parse(
    localStorage.getItem("attendanceRecords") || "{}"
);

function renderAttendance() {
    const date = attendanceDate.value;
    const records = attendanceRecords[date] || {};

    attendanceList.replaceChildren();

    let presentCount = 0;
    let absentCount = 0;

    students.forEach(student => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = student.name;

        const rollCell = document.createElement("td");
        rollCell.textContent = student.roll;

        const statusCell = document.createElement("td");
        const select = document.createElement("select");

        select.dataset.studentId = student.id;

        [
            { value: "Present", label: "Present" },
            { value: "Absent", label: "Absent" },
            { value: "Unmarked", label: "Not Marked" }
        ].forEach(optionData => {
            const option = document.createElement("option");
            option.value = optionData.value;
            option.textContent = optionData.label;
            select.appendChild(option);
        });

        select.value = records[student.id] || "Unmarked";

        if (select.value === "Present") presentCount++;
        if (select.value === "Absent") absentCount++;

        select.addEventListener("change", () => {
            renderAttendanceCounts();
        });

        statusCell.appendChild(select);
        row.append(nameCell, rollCell, statusCell);
        attendanceList.appendChild(row);
    });

    presentToday.textContent = presentCount;
    absentToday.textContent = absentCount;
}

function renderAttendanceCounts() {
    const selects = attendanceList.querySelectorAll("select");

    let presentCount = 0;
    let absentCount = 0;

    selects.forEach(select => {
        if (select.value === "Present") presentCount++;
        if (select.value === "Absent") absentCount++;
    });

    presentToday.textContent = presentCount;
    absentToday.textContent = absentCount;
}

saveAttendanceButton.addEventListener("click", () => {
    const date = attendanceDate.value;

    if (!date) {
        attendanceMessage.textContent = "Please select a date.";
        return;
    }

    const records = {};

    attendanceList.querySelectorAll("select").forEach(select => {
        if (select.value !== "Unmarked") {
            records[select.dataset.studentId] = select.value;
        }
    });

    attendanceRecords[date] = records;

    localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(attendanceRecords)
    );

    attendanceMessage.textContent = "Attendance saved successfully!";
    renderAttendance();
});

attendanceDate.addEventListener("change", () => {
    attendanceMessage.textContent = "";
    renderAttendance();
});

renderAttendance();
const marksList = document.getElementById("marksList");
const marksMessage = document.getElementById("marksMessage");

let marksRecords = JSON.parse(
    localStorage.getItem("marksRecords") || "{}"
);
 
    students.forEach(student => {
        const savedRecords = marksRecords[student.id];

        const saved = Array.isArray(savedRecords)
    ? (savedRecords[0] || {
        subject: "Mathematics",
        obtained: "",
        maximum: 100
      })
    : (savedRecords || {
        subject: "Mathematics",
        obtained: "",
        maximum: 100
      });

        const row = document.createElement("tr");

        function addCell(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
            return cell;
        }

        addCell(student.name);
        addCell(student.roll);

        const subjectCell = addCell("");
        const subjectInput = document.createElement("input");
        subjectInput.type = "text";
        subjectInput.value = saved.subject;
        subjectInput.maxLength = 60;
        subjectInput.setAttribute("aria-label", "Subject");
        subjectCell.appendChild(subjectInput);

        const obtainedCell = addCell("");
        const obtainedInput = document.createElement("input");
        obtainedInput.type = "number";
        obtainedInput.min = "0";
        obtainedInput.step = "0.01";
        obtainedInput.value = saved.obtained;
        obtainedInput.placeholder = "e.g. 75";
        obtainedInput.setAttribute("aria-label", "Marks obtained");
        obtainedCell.appendChild(obtainedInput);

        const maximumCell = addCell("");
        const maximumInput = document.createElement("input");
        maximumInput.type = "number";
        maximumInput.min = "1";
        maximumInput.step = "0.01";
        maximumInput.value = saved.maximum;
        maximumInput.setAttribute("aria-label", "Maximum marks");
        maximumCell.appendChild(maximumInput);

        const percentageCell = addCell("—");
        const resultCell = addCell("—");
        const actionCell = addCell("");

        function updatePreview() {
            const obtained = Number(obtainedInput.value);
            const maximum = Number(maximumInput.value);
            const valid = obtainedInput.value.trim() !== "" &&
                maximumInput.value.trim() !== "" &&
                Number.isFinite(obtained) &&
                Number.isFinite(maximum) &&
                obtained >= 0 &&
                maximum > 0 &&
                obtained <= maximum;

            if (!valid) {
                percentageCell.textContent = "—";
                resultCell.textContent = "Invalid marks";
                resultCell.className = "fail-result";
                return;
            }

            const percentage = obtained / maximum * 100;
            percentageCell.textContent = percentage.toFixed(2) + "%";
            resultCell.textContent = percentage >= 40 ? "Pass" : "Fail";
            resultCell.className =
                percentage >= 40 ? "pass-result" : "fail-result";
        }

        obtainedInput.addEventListener("input", updatePreview);
        maximumInput.addEventListener("input", updatePreview);

        subjectInput.addEventListener("input", () => {
            marksMessage.textContent = "";
        });

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.textContent = "Save";
        saveButton.className = "save-marks-btn";

        saveButton.addEventListener("click", () => {
            const subject = subjectInput.value.trim();
            const obtainedText = obtainedInput.value.trim();
            const maximumText = maximumInput.value.trim();
            const obtained = Number(obtainedText);
            const maximum = Number(maximumText);

            if (
                !subject ||
                obtainedText === "" ||
                maximumText === "" ||
                !Number.isFinite(obtained) ||
                !Number.isFinite(maximum) ||
                obtained < 0 ||
                maximum <= 0 ||
                obtained > maximum
            ) {
                marksMessage.textContent =
                    "Enter a subject and valid marks (obtained must not exceed maximum).";
                return;
            }

            marksRecords[student.id] = {
                subject,
                obtained,
                maximum
            };

            localStorage.setItem(
                "marksRecords",
                JSON.stringify(marksRecords)
            );

            marksMessage.textContent =
                "Marks saved for " + student.name + ".";

            renderMarks();
        });

        actionCell.appendChild(saveButton);

        updatePreview();
        marksList.appendChild(row);
    });

console.log("Students:", students);
console.log("Marks table:", document.getElementById("marksList"));


const reportStudent = document.getElementById("reportStudent");
const generateReport = document.getElementById("generateReport");
const printReport = document.getElementById("printReport");
const reportCard = document.getElementById("reportCard");

// Load saved marks and convert the old single-subject format.
// reuse marksRecords declared earlier in this file.

students.forEach(student => {
    const saved = marksRecords[student.id];

    if (saved && !Array.isArray(saved)) {
        marksRecords[student.id] = [{
            subject: saved.subject || "Mathematics",
            obtained: saved.obtained ?? "",
            maximum: saved.maximum || 100
        }];
    }
});

function saveAllMarks() {
    localStorage.setItem(
        "marksRecords",
        JSON.stringify(marksRecords)
    );
}

function refreshReportStudents() {
    const previousValue = reportStudent.value;
    reportStudent.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "-- Select Student --";
    reportStudent.appendChild(placeholder);

    students.forEach(student => {
        const option = document.createElement("option");
        option.value = student.id;
        option.textContent = student.name + " (" + student.roll + ")";
        reportStudent.appendChild(option);
    });

    if (students.some(s => s.id === previousValue)) {
        reportStudent.value = previousValue;
    }
}

function renderMarks() {
    marksList.replaceChildren();

    students.forEach(student => {
        const records = marksRecords[student.id] || [];

        // Show one empty subject row for a student with no saved marks.
        const rows = records.length ? records : [{
            subject: "",
            obtained: "",
            maximum: 100
        }];

        rows.forEach((saved, index) => {
            const row = document.createElement("tr");

            function addCell(value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
                return cell;
            }

            addCell(student.name);
            addCell(student.roll);

            const subjectInput = document.createElement("input");
            subjectInput.type = "text";
            subjectInput.placeholder = "Subject";
            subjectInput.maxLength = 60;
            subjectInput.value = saved.subject || "";
            const subjectCell = addCell("");
            subjectCell.appendChild(subjectInput);

            const obtainedInput = document.createElement("input");
            obtainedInput.type = "number";
            obtainedInput.min = "0";
            obtainedInput.step = "0.01";
            obtainedInput.placeholder = "Obtained";
            obtainedInput.value = saved.obtained ?? "";
            const obtainedCell = addCell("");
            obtainedCell.appendChild(obtainedInput);

            const maximumInput = document.createElement("input");
            maximumInput.type = "number";
            maximumInput.min = "1";
            maximumInput.step = "0.01";
            maximumInput.value = saved.maximum || 100;
            const maximumCell = addCell("");
            maximumCell.appendChild(maximumInput);

            const percentageCell = addCell("—");
            const resultCell = addCell("—");
            const actionCell = addCell("");

            function updatePreview() {
                const obtainedText = obtainedInput.value.trim();
                const maximumText = maximumInput.value.trim();
                const obtained = Number(obtainedText);
                const maximum = Number(maximumText);

                const valid =
                    obtainedText !== "" &&
                    maximumText !== "" &&
                    Number.isFinite(obtained) &&
                    Number.isFinite(maximum) &&
                    obtained >= 0 &&
                    maximum > 0 &&
                    obtained <= maximum;

                if (!valid) {
                    percentageCell.textContent = "—";
                    resultCell.textContent = "—";
                    return;
                }

                const percentage = obtained / maximum * 100;
                percentageCell.textContent =
                    percentage.toFixed(2) + "%";
                resultCell.textContent =
                    percentage >= 40 ? "Pass" : "Fail";
            }

            obtainedInput.addEventListener("input", updatePreview);
            maximumInput.addEventListener("input", updatePreview);

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "Save";
            saveButton.className = "save-marks-btn";

            saveButton.addEventListener("click", () => {
                const subject = subjectInput.value.trim();
                const obtainedText = obtainedInput.value.trim();
                const maximumText = maximumInput.value.trim();
                const obtained = Number(obtainedText);
                const maximum = Number(maximumText);

                if (
                    !subject ||
                    obtainedText === "" ||
                    maximumText === "" ||
                    !Number.isFinite(obtained) ||
                    !Number.isFinite(maximum) ||
                    obtained < 0 ||
                    maximum <= 0 ||
                    obtained > maximum
                ) {
                    marksMessage.textContent =
                        "Enter a subject and valid marks.";
                    return;
                }

                if (!marksRecords[student.id]) {
                    marksRecords[student.id] = [];
                }

                marksRecords[student.id][index] = {
                    subject,
                    obtained,
                    maximum
                };

                saveAllMarks();
                marksMessage.textContent =
                    "Marks saved for " + student.name + ".";
                renderMarks();
            });

            const addButton = document.createElement("button");
            addButton.type = "button";
            addButton.textContent = "Add Subject";
            addButton.addEventListener("click", () => {
                if (!marksRecords[student.id]) {
                    marksRecords[student.id] = [];
                }

                marksRecords[student.id].push({
                    subject: "",
                    obtained: "",
                    maximum: 100
                });

                saveAllMarks();
                renderMarks();
            });

            actionCell.append(saveButton, addButton);
            updatePreview();
            marksList.appendChild(row);
        });
    });

    refreshReportStudents();
}

function makeReportCell(row, value, tag = "td") {
    const cell = document.createElement(tag);
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
}

generateReport.addEventListener("click", () => {
    reportCard.replaceChildren();

    const student = students.find(
        s => s.id === reportStudent.value
    );

    if (!student) {
        reportCard.textContent = "Please select a student.";
        return;
    }

    const records = marksRecords[student.id] || [];

    const validRecords = records.filter(record =>
        record.subject &&
        record.obtained !== "" &&
        Number.isFinite(Number(record.obtained)) &&
        Number.isFinite(Number(record.maximum)) &&
        Number(record.maximum) > 0 &&
        Number(record.obtained) >= 0 &&
        Number(record.obtained) <= Number(record.maximum)
    );

    if (validRecords.length === 0) {
        reportCard.textContent =
            "No saved marks found. Save at least one subject first.";
        return;
    }

    const heading = document.createElement("h3");
    heading.textContent = "Student Report Card";
    reportCard.appendChild(heading);

    const details = document.createElement("p");
    details.textContent =
        "Name: " + student.name +
        " | Roll Number: " + student.roll +
        " | Course: " + student.course;
    reportCard.appendChild(details);

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["Subject", "Marks", "Maximum", "Percentage", "Result"]
        .forEach(label => makeReportCell(headerRow, label, "th"));

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    let totalObtained = 0;
    let totalMaximum = 0;
    let allPassed = true;

    validRecords.forEach(record => {
        const obtained = Number(record.obtained);
        const maximum = Number(record.maximum);
        const percentage = obtained / maximum * 100;
        const passed = percentage >= 40;

        if (!passed) allPassed = false;

        totalObtained += obtained;
        totalMaximum += maximum;

        const row = document.createElement("tr");
        makeReportCell(row, record.subject);
        makeReportCell(row, obtained);
        makeReportCell(row, maximum);
        makeReportCell(row, percentage.toFixed(2) + "%");
        makeReportCell(row, passed ? "Pass" : "Fail");
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    reportCard.appendChild(table);

    const overallPercentage =
        totalMaximum > 0 ? totalObtained / totalMaximum * 100 : 0;

    const summary = document.createElement("p");
    summary.textContent =
        "Total: " + totalObtained + " / " + totalMaximum +
        " | Overall Percentage: " + overallPercentage.toFixed(2) +
        "% | Overall Result: " +
        (allPassed ? "Pass" : "Fail");

    reportCard.appendChild(summary);
});

printReport.addEventListener("click", () => {
    if (!reportCard.querySelector("table")) {
        alert("Generate a report card first.");
        return;
    }

    window.print();
});

renderMarks();
// Professional Dashboard Statistics
function renderDashboard() {
  const totalEl = document.getElementById("dashboardTotalStudents");
  const subjectsEl = document.getElementById("dashboardSubjects");
  const averageEl = document.getElementById("dashboardAverageMarks");
  const markedEl = document.getElementById("dashboardMarkedStudents");

  if (!totalEl || !subjectsEl || !averageEl || !markedEl) return;

  totalEl.textContent = students.length;

  const allMarks = Object.values(marksRecords || {}).flat();

  const validMarks = allMarks.filter(mark =>
    mark &&
    String(mark.subject || "").trim() !== "" &&
    mark.obtained !== "" &&
    mark.maximum !== "" &&
    Number.isFinite(Number(mark.obtained)) &&
    Number.isFinite(Number(mark.maximum)) &&
    Number(mark.maximum) > 0 &&
    Number(mark.obtained) >= 0 &&
    Number(mark.obtained) <= Number(mark.maximum)
  );

  const subjects = new Set(
    validMarks.map(mark => mark.subject.trim().toLowerCase())
  );

  const markedStudentIds = students
    .filter(student =>
      (marksRecords[student.id] || []).some(mark =>
        mark &&
        String(mark.subject || "").trim() !== "" &&
        mark.obtained !== "" &&
        mark.maximum !== "" &&
        Number(mark.maximum) > 0 &&
        Number(mark.obtained) >= 0 &&
        Number(mark.obtained) <= Number(mark.maximum)
      )
    )
    .map(student => student.id);

  const totalObtained = validMarks.reduce(
    (sum, mark) => sum + Number(mark.obtained), 0
  );

  const totalMaximum = validMarks.reduce(
    (sum, mark) => sum + Number(mark.maximum), 0
  );

  const percentage = totalMaximum > 0
    ? (totalObtained / totalMaximum) * 100
    : 0;

  subjectsEl.textContent = subjects.size;
  markedEl.textContent = markedStudentIds.length;
  averageEl.textContent = `${percentage.toFixed(1)}%`;
}

renderDashboard();