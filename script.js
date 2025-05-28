document.addEventListener("DOMContentLoaded", () => {
  const codeContainer = document.getElementById("hospital-code-container");
  const codeInput = document.getElementById("hospital-code");
  const submitBtn = document.getElementById("submit-code");
  const errorMsg = document.getElementById("error-message");
  const BASE_URL = "https://teal-eternal-directly.ngrok-free.app";
  // عرض النافذة عند بداية التحميل مع إضافة الكلاس 'active'
  codeContainer.classList.add("active");

  submitBtn.onclick = async () => {
    const code = codeInput.value.trim();
    if (!code) {
      errorMsg.innerText = "يرجى إدخال الرمز.";
      return;
    }
    errorMsg.innerText = "";

    try {
      const response = await fetch(`${BASE_URL}/api/hospital/get_hospital/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: code }),
      });

      const result = await response.json();

      if (response.ok && result.hospital_name) {
        document.getElementById("hospital-name").innerText =
          result.hospital_name;

        // إخفاء النافذة بإزالة الكلاس 'active'
        codeContainer.classList.remove("active");

        const params = new URLSearchParams(window.location.search);
        const userId = params.get("id");
        loadUserData(userId);
      } else {
        errorMsg.innerText = result.error || "رمز غير صحيح.";
      }
    } catch (err) {
      console.error(err);
      errorMsg.innerText = "حدث خطأ، حاول مرة أخرى.";
    }
  };

  async function loadUserData(userId) {
    if (!userId) {
      document.getElementById("user-info").innerText = "لم يتم تحديد المستخدم.";
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/api/midecal/medical/get_by_post/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ user_id: userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ في تحميل الملف الطبي");
      }

      const tableBody = document.querySelector("#medical-table tbody");
      tableBody.innerHTML = "";

      // عرض معلومات المستخدم الشخصية في div منفصل
      const userDetailsDiv = document.getElementById("user-details");
      userDetailsDiv.innerHTML = `
      <p><strong>الاسم الكامل:</strong> ${data.first_name} ${data.last_name}</p>
      <p><strong>العمر:</strong> ${data.age}</p>
      <p><strong>الجنس:</strong> ${data.gender}</p>
      <p><strong>فصيلة الدم:</strong> ${data.blood_type}</p>
      <p><strong>الطبيب المعالج:</strong> ${
        data.modified_by_doctor || "غير معروف"
      }</p>
      <p><strong>التوصية الطبية:</strong> ${
        data.medical_recommendation || "لا توجد توصية"
      }</p>
    `;

      const rows = [
        {
          label: "الأمراض",
          value:
            Array.isArray(data.diseases) && data.diseases.length > 0
              ? data.diseases.join(", ")
              : "لا توجد أمراض مسجلة",
        },
        {
          label: "الحساسية",
          value:
            Array.isArray(data.allergies) && data.allergies.length > 0
              ? data.allergies.join(", ")
              : "لا توجد حساسية مسجلة",
        },
        {
          label: "العمليات الجراحية",
          value:
            Array.isArray(data.surgeries) && data.surgeries.length > 0
              ? data.surgeries.join(", ")
              : "لا توجد عمليات جراحية",
        },
      ];

      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${row.label}</td><td>${row.value}</td>`;
        tableBody.appendChild(tr);
      });

      document.getElementById("user-info").innerText =
        "تم تحميل الملف الطبي بنجاح.";
    } catch (error) {
      console.error(error);
      document.getElementById("user-info").innerText =
        "حدث خطأ أثناء تحميل الملف الطبي.";
    }
  }
});
