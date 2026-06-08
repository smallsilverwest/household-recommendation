let depositData = [];
let monthlyData = [];

/* =========================
   1. 데이터 로딩
========================= */
async function loadData() {
    try {
        depositData = await fetch("deposit.json").then(r => r.json());
        monthlyData = await fetch("monthly.json").then(r => r.json());
        console.log("데이터 로딩 완료", depositData.length, monthlyData.length);
    } catch (e) {
        console.error("데이터 로딩 실패:", e);
    }
}

loadData();

/* =========================
   2. 안전 숫자 변환
========================= */
function safeNumber(value, defaultValue = 999999) {
    const n = Number(value);
    return isNaN(n) ? defaultValue : n;
}

/* =========================
   3. 데이터 선택
========================= */
function getData(type) {
    return type === "전세" ? depositData : monthlyData;
}

/* =========================
   4. 추천 로직
========================= */
function recommend() {

    const type = document.getElementById("type").value;

    const depositBudget = safeNumber(document.getElementById("deposit").value);
    const monthlyBudget = safeNumber(document.getElementById("rent").value);

    const priority1 = document.getElementById("priority1").value;
    const priority2 = document.getElementById("priority2").value;
    const priority3 = document.getElementById("priority3").value;

    let data = getData(type);

    if (!data || data.length === 0) {
        document.getElementById("result").innerText = "데이터 없음";
        return;
    }

    console.log("전체 데이터:", data.length);

    /* =========================
       5. 필터 (핵심 안정화)
    ========================== */
    data = data.filter(d => {

        const deposit = safeNumber(d["보증금(만원)"]);
        const rent = safeNumber(d["임대료(만원)"], 0);

        if (type === "전세") {
            return deposit <= depositBudget;
        } else {
            return deposit <= depositBudget && rent <= monthlyBudget;
        }
    });

    console.log("필터 후:", data.length);

    if (data.length === 0) {
        document.getElementById("result").innerText =
            "조건에 맞는 매물이 없습니다 (필터 너무 빡셈)";
        return;
    }

    /* =========================
       6. 점수 계산 (ipynb 변환)
    ========================== */
    data.forEach(d => {

        d.score =
            (safeNumber(d[priority1]) * 3) +
            (safeNumber(d[priority2]) * 2) +
            (safeNumber(d[priority3]) * 1);
    });

    /* =========================
       7. 정렬
    ========================== */
    data.sort((a, b) => b.score - a.score);

    /* =========================
       8. TOP 3
    ========================== */
    const top3 = data.slice(0, 3);

    /* =========================
       9. 출력
    ========================== */
    document.getElementById("result").innerText =
        JSON.stringify(top3, null, 2);
}
