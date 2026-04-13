document.addEventListener("DOMContentLoaded", () => {
  const productsSection = document.getElementById("products");
  const billItems = document.getElementById("bill-items");
  const totalElement = document.getElementById("total");
  const payBtn = document.getElementById("pay");
  const printBtn = document.getElementById("print");
  const datetimeElem = document.querySelector(".datetime p");

  let total = 0;
  let bill = [];
  let products = {};
  let categoriesMap = {};
  let currentCat = null;

  // ===================== تحديث الوقت والتاريخ =====================
  function updateDateTime() {
    const now = new Date();
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    };
    datetimeElem.textContent = now.toLocaleString("ar-EG", options);
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // ===================== تحميل الفئات والمنتجات =====================
  async function loadProducts() {
    try {
      const categoriesRes = await fetch("/api/categories");
      const categories = await categoriesRes.json();

      categories.forEach((cat) => {
        categoriesMap[cat.name] = cat.id; // استخدام الاسم مباشرة
        products[cat.id] = [];
      });

      const productsRes = await fetch("/api/products");
      const allProducts = await productsRes.json();

      allProducts.forEach((p) => {
        if (products[p.category_id]) {
          products[p.category_id].push({
            id: p.id,
            name: p.name,
            price: p.price
          });
        }
      });

      console.log("Loaded categories:", categoriesMap);
      console.log("Loaded products:", products);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  }

  loadProducts();

  // ===================== عرض المنتجات =====================
  function renderProducts(list) {
    productsSection.innerHTML = "";
    if (!list || list.length === 0) {
      productsSection.innerHTML = "<p>لا توجد منتجات في هذا القسم.</p>";
      return;
    }

    list.forEach((p) => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `<h3>${p.name}</h3><p>${p.price} جنيه</p>`;
      div.addEventListener("click", () => addToBill(p));
      productsSection.appendChild(div);
    });
  }

  // ===================== إضافة المنتج للفاتورة =====================
  function addToBill(p) {
    const existing = bill.find((item) => item.id === p.id);
    if (existing) {
      existing.qty++;
      existing.total = Number(existing.qty) * Number(existing.price); 
    } else {
      bill.push({ ...p, qty: 1, total: Number(p.price) });
    }
    updateBill();
  }

  // ===================== تحديث الفاتورة =====================
  function updateBill() {
    billItems.innerHTML = "";
    total = 0;

    bill.forEach((p, i) => {
      total += Number(p.total);
      const div = document.createElement("div");
      div.className = "bill-item";
      div.innerHTML = `
        <span>${p.name}</span>
        <input type="number" min="1" value="${p.qty}" data-index="${i}" class="qty-input">
        <span>${Number(p.total).toFixed(2)} جنيه</span>
        <button data-index="${i}" class="remove">❌</button>
      `;
      billItems.appendChild(div);
    });

    // تحديث الكميات
    document.querySelectorAll(".qty-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const index = e.target.dataset.index;
        const newQty = parseInt(e.target.value) || 1;
        bill[index].qty = newQty;
        bill[index].total = bill[index].price * newQty;
        updateBill();
      });
    });

    // حذف عنصر
    document.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        bill.splice(index, 1);
        updateBill();
      });
    });

    totalElement.textContent = total.toFixed(2);
  }

  // ===================== التعامل مع الأزرار الجانبية =====================
  document.querySelectorAll(".categories button").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const cat = btn.dataset.cat;
      currentCat = cat;

      // أزرار خاصة (مش فئات)
      if (["add-item", "purchases", "sales", "profit", "exit"].includes(cat)) {
        await handleSpecialButton(cat);
        return;
      }

      // عرض المنتجات حسب التصنيف
      const catId = parseInt(btn.dataset.cat); // الرقم الصحيح
      if (products[catId]) {
        renderProducts(products[catId]);
      } else {
        productsSection.innerHTML = "<p>لا توجد منتجات في هذا القسم.</p>";
      }
      
    });
  });

  // ===================== الدفع =====================
// ===================== الدفع =====================
let lastInvoiceId = null;

payBtn.addEventListener("click", async () => {
  if (bill.length === 0) return alert("⚠️ الفاتورة فارغة!");

  const phone = document.getElementById("phone")?.value.trim() || "";
  const payment = parseFloat(document.getElementById("paid")?.value) || 0;
  if (payment < total) return alert("⚠️ المبلغ المدفوع أقل من الإجمالي!");

  const change = payment - total;

  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        total,
        paid: payment,
        change_amount: change,
        phone,
        items: bill.map(p => ({ product_id: p.id, qty: p.qty, price: p.price }))
      })
    });

    const data = await res.json();

    if (res.ok) {
      lastInvoiceId = data.saleId; // حفظ رقم الفاتورة
      alert(`✅ تم الدفع بنجاح!\nرقم الفاتورة: ${lastInvoiceId}\nالإجمالي: ${total.toFixed(2)} ج\nالمدفوع: ${payment.toFixed(2)} ج\nالباقي: ${change.toFixed(2)} ج`);
    } else {
      console.error("Save sales failed:", data);
      alert("❌ خطأ أثناء حفظ عملية البيع");
    }
  } catch (err) {
    console.error(err);
    alert("❌ حدث خطأ أثناء الدفع");
  }
});

// ===================== الطباعة =====================
printBtn.addEventListener("click", () => {
  if (!lastInvoiceId) return alert("⚠️ لم يتم حفظ الفاتورة بعد! اضغط على (دفع) أولاً.");

  const phone = document.getElementById("phone")?.value.trim() || "غير محدد";
  const notes = document.getElementById("notes")?.value.trim() || "لا توجد ملاحظات";
  const payment = parseFloat(document.getElementById("paid")?.value) || 0;
  const change = payment - total;
  const now = new Date();
  const date = now.toLocaleDateString("ar-EG");
  const time = now.toLocaleTimeString("ar-EG");

  const receipt = `
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <title>فاتورة B5</title>
      <style>
        body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 15px; font-size: 15px; }
        h2 { text-align: center; color: #d62828; margin: 0; }
        .header { text-align: center; margin-bottom: 10px; }
        .logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; }
        .info { text-align: center; margin-bottom: 10px; }
        .items { margin-top: 10px; }
        .item { display:flex; justify-content:space-between; margin:4px 0; }
        .totals { margin-top:10px; border-top:1px dashed #000; padding-top:8px; }
        .footer { text-align:center; margin-top:10px; font-size:13px; color:#555; }
      </style>
    </head>
    <body>
      <div class="header">
        
        <h2>مطعم B5</h2>
      </div>
      <div class="info">
        <p>رقم الفاتورة: <strong>${lastInvoiceId}</strong></p>
        <p>📅 ${date} 🕒 ${time}</p>
        <p>📞 العميل: ${phone}</p>
        <p>📝 الملاحظات: ${notes}</p>

      </div>
      <hr>
      <div class="items">
        ${bill.map(p => `<div class="item"><span>${p.name} × ${p.qty}</span><span>${p.total.toFixed(2)} ج</span></div>`).join("")}
      </div>
      <div class="totals">
        <div style="display:flex;justify-content:space-between"><span>الإجمالي:</span><span>${total.toFixed(2)} ج</span></div>
        <div style="display:flex;justify-content:space-between"><span>المدفوع:</span><span>${payment.toFixed(2)} ج</span></div>
        <div style="display:flex;justify-content:space-between"><span>الباقي:</span><span>${change.toFixed(2)} ج</span></div>
      </div>
      <hr>
      <div class="footer">
        <p>شكراً لتعاملكم معنا ❤️</p>
        <p>تابعنا على Instagram: <strong>@b5.restaurant</strong></p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(receipt);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();

  // بعد الطباعة فقط يتم مسح الفاتورة
  bill = [];
  total = 0;
  document.getElementById("phone").value = "";
  document.getElementById("paid").value = "";
  updateBill();
});


  // ===================== الأزرار الخاصة =====================
  async function handleSpecialButton(cat) {
    switch (cat) {
      case "add-item":
        window.open("add-item.html", "_blank");
        break;
      case "purchases":
        window.open("purchases.html", "_blank");
        break;
      case "sales":
        window.open("sales.html", "_blank");
        break;
        case "profit":
          if (sessionStorage.getItem("auth")) {
            window.open("profit.html", "_blank"); // الدخول مباشرة إذا تم تسجيل الدخول
          } else {
            window.open("auth.html?to=profit.html", "_blank"); // إعادة التوجيه لصفحة تسجيل الدخول
          }
          break;
        
      case "exit":
        if (confirm("هل تريد الخروج من النظام؟")) {
          window.close();
        }
        break;
    }
  // تحديث المنتجات تلقائيًا كل 3 ثواني
setInterval(async () => {
  await loadProducts();
  if (currentCat && products[currentCat]) {
    renderProducts(products[currentCat]);
  }
}, 3000);

  } 
});
