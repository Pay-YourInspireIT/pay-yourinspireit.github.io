const telegramForm = document.getElementById('telegram-form');
const statusMessage = document.getElementById('status');

// Replace with your Telegram bot token and chat ID
const botToken = '7519273136:AAHZ7eBXEoVZRQFqILu8tGnuMLvtZOWohqc';
const chatId = '7945358964';

// Function to send message from form
async function sendMessageFromForm(name, contact, message) {
  const telegramMessage = `
    ⚠️ New Message From Your Inspire IT:
    - Name: ${name}
    - Contact: ${contact}
    - Message: ${message}
  `;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: telegramMessage,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

// Function to save page history in localStorage
function savePageHistory() {
  const pageInfo = {
    url: window.location.href,
    title: document.title,
    timestamp: new Date().toLocaleString(),
  };

  let history = JSON.parse(localStorage.getItem('pageHistory')) || [];
  history.unshift(pageInfo);

  if (history.length > 40) {
    history = history.slice(0, 40);
  }

  localStorage.setItem('pageHistory', JSON.stringify(history));
}

// Function to get visitor info
async function getVisitorInfo() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const ipData = await response.json();

    const visitorInfo = {
      deviceType: /Mobi/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      operatingSystem: navigator.platform,
      browserName: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ipAddress: ipData.ip,
      currentPage: {
        url: window.location.href,
        title: document.title,
      },
      history: JSON.parse(localStorage.getItem('pageHistory')) || [],
    };

    return visitorInfo;
  } catch (error) {
    console.error('Error fetching visitor info:', error);
    return null;
  }
}

// Function to send visitor info to Telegram
async function sendVisitorInfoToTelegram() {
  savePageHistory();

  const info = await getVisitorInfo();

  if (!info) {
    console.error('Visitor info not available.');
    return;
  }

  let historyMessage = info.history
    .slice(0, 5)
    .map(
      (entry, index) =>
        `  ${index + 1}. [${entry.title}](${entry.url}) - ${entry.timestamp}`
    )
    .join('\n');

  const message = `
    📱 *Visitor Info*:
    - Device Type: ${info.deviceType}
    - OS: ${info.operatingSystem}
    - Browser: ${info.browserName}
    - Screen: ${info.screenResolution}
    - Language: ${info.language}
    - Timezone: ${info.timezone}
    - IP Address: ${info.ipAddress}
    - Current Page: ${info.currentPage.title} (${info.currentPage.url})

    🕒 *Last 5 Pages*:
${historyMessage}
  `;

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send visitor info.');
    }
  } catch (error) {
    console.error('Error sending visitor info:', error);
  }
}

// Handle form submission
telegramForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const contact = document.getElementById('contact').value;
  const message = document.getElementById('message').value;

  const messageSent = await sendMessageFromForm(name, contact, message);

  if (messageSent) {
    statusMessage.textContent = 'আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে! আমরা শিগগিরই আপনার সাথে যোগাযোগ করব।';
    statusMessage.style.color = 'green';
    telegramForm.reset();
  } else {
    statusMessage.textContent = 'মেসেজ পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
    statusMessage.style.color = 'red';
  }

  // Send visitor info after the form message is sent
  await sendVisitorInfoToTelegram();
});

// Send visitor info on page load
window.addEventListener('DOMContentLoaded', () => {
  sendVisitorInfoToTelegram();
});
