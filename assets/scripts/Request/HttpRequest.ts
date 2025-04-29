export async function postdata(url = "", data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: "cors",// no-cors, *cors, same-origin
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    return response.json();
}
export async function getData(url = "") {
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: "cors",
      });
  
      if (!response.ok) { // 处理 HTTP 错误状态
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      // 可在此添加统一错误处理（如上报日志、展示用户提示）
      throw error; // 向上层抛出异常
    }
  }
  