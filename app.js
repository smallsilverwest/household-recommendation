let depositData = [];
let monthlyData = [];

/* =========================
   1. 데이터 로딩
========================= */
async function loadData() {
    try {
        depositData = await fetch("deposit.json").then(res => res.json());
        monthlyData = await fetch("monthly.json").then(res => res.json());
        console.log("데이터 로딩 완료");
    } catch (e) {
        console.error("데이터 로딩 실패:", e);
    }
}

loadData();

/* =========================
   2. 데이터 선택 함수
========================= */
function getData(type) {
    return type === "전세" ? depositData : monthlyData;
}

/* =========================
   3. 추천 함수 (핵심)
========================= */
function recommend() {

    const type = document.getElementById("type").value;
    const depositBudget = Number(document.getElementById("deposit").value);
    const monthlyBudget = Number(document.getElementById("rent").value);

    const priority1 = document.getElementById("priority1").value;
    const priority2 = document.getElementById("priority2").value;
    const priority3 = document.getElementById("priority3").value;

    let data = getData(type);

    if (!data || data.length === 0) {
        document.getElementById("result").innerText = "데이터가 없습니다.";
        return;
    }

    /* =========================
       1) 예산 필터링
    ========================= */
    if (type === "전세") {
        data = data.filter(d => d.deposit <= depositBudget);
    } else {
        data = data.filter(d =>
            d.deposit <= depositBudget &&
            d.rent <= monthlyBudget
        );
    }

    if (data.length === 0) {
        document.getElementById("result").innerText = "조건에 맞는 매물이 없습니다.";
        return;
    }

    /* =========================
       2) 점수 계산
    ========================= */
    data.forEach(d => {
        d.score =
            (d[priority1] || 0) * 3 +
            (d[priority2] || 0) * 2 +
            (d[priority3] || 0) * 1;
    });

    /* =========================
       3) 정렬
    ========================= */
    data.sort((a, b) => b.score - a.score);

    /* =========================
       4) TOP 3
    ========================= */
    const top3 = data.slice(0, 3);

    /* =========================
       5) 출력
    ========================= */
    document.getElementById("result").innerText =
        JSON.stringify(top3, null, 2);
}
