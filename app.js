let depositData = [];
let monthlyData = [];

// 데이터 로딩
async function loadData() {
    depositData = await fetch("deposit.json").then(r => r.json());
    monthlyData = await fetch("monthly.json").then(r => r.json());
}

loadData();
