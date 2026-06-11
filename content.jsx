import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import Content from './content/Content.jsx';

const injectFont = () => {
  const styleNode = document.createElement("style");
  styleNode.textContent = `
    @font-face {
      font-family: 'AdobeClean';
      src: url(${chrome.runtime.getURL("/fonts/AdobeClean.ttf")}) format('truetype');
      font-weight: 400;
      font-style: normal;
    }
    
    #gmail-ai-assistant-container,
    #gmail-ai-assistant-container * {
      font-family: 'AdobeClean', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
  `;
  document.head.appendChild(styleNode);
};

let isInjected = false;

const injectGmailAssistant = () => {
  if (isInjected) {
    console.log('Gmail AI Assistant already injected.');
    return;
  }

  const targetElement = document.querySelector('.nH'); 

  if (targetElement) {
    if (document.getElementById('gmail-ai-assistant-container')) {
      isInjected = true;
      console.log('Gmail AI Assistant container found. Injection complete.');
      return;
    }

    const container = document.createElement('div');
    container.id = 'gmail-ai-assistant-container';
    
    container.className = 'gmail-assistant-injected-panel';

    if (targetElement.firstChild) {
        targetElement.insertBefore(container, targetElement.firstChild);
    } else {
        targetElement.appendChild(container);
    }

    injectFont();
    
    createRoot(container).render(
      <StrictMode>
        <Content />
      </StrictMode>
    );

    isInjected = true;
    console.log('Gmail AI Assistant initialized and React rendering complete.');
  } 
};

const observer = new MutationObserver((mutations, observerInstance) => {
  if (!isInjected) {
    injectGmailAssistant();
    
    if (isInjected) {
      observerInstance.disconnect();
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

window.addEventListener('popstate', injectGmailAssistant);
window.addEventListener('pushstate', injectGmailAssistant);