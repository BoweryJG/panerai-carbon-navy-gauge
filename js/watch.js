// Main Watch Application
class PaneraiWatch {
    constructor() {
        this.configManager = new ConfigManager();
        this.supabaseManager = new SupabaseManager(this.configManager);
        this.updateTimer = null;
        this.isFullscreen = false;
        this.currentData = {};
        
        this.init();
    }

    init() {
        this.showHUDBoot();
        this.setupEventListeners();
        this.loadConfiguration();
        this.addMinuteMarks();
        this.startClock();
        this.connectToSupabase();
        this.createConnectionIndicator();
        this.setup3DInteraction();
    }
    
    showHUDBoot() {
        const hudElement = document.createElement('div');
        hudElement.className = 'hud-boot';
        hudElement.textContent = 'INITIALIZING...';
        document.body.appendChild(hudElement);
        
        // Update text during boot sequence
        const messages = [
            'INITIALIZING...',
            'LOADING TACTICAL SYSTEMS...',
            'CALIBRATING SENSORS...',
            'ESTABLISHING SECURE LINK...',
            'SYSTEM OPERATIONAL'
        ];
        
        let messageIndex = 0;
        const bootInterval = setInterval(() => {
            messageIndex++;
            if (messageIndex < messages.length) {
                hudElement.textContent = messages[messageIndex];
            } else {
                clearInterval(bootInterval);
                setTimeout(() => hudElement.remove(), 500);
            }
        }, 600);
    }

    setupEventListeners() {
        // Configuration inputs
        document.getElementById('config-12-metric').addEventListener('change', (e) => {
            this.updateMetricConfig('12', e.target.value);
        });
        
        document.getElementById('config-3-metric').addEventListener('change', (e) => {
            this.updateMetricConfig('3', e.target.value);
        });
        
        document.getElementById('config-6-metric').addEventListener('change', (e) => {
            this.updateMetricConfig('6', e.target.value);
        });
        
        document.getElementById('config-9-metric').addEventListener('change', (e) => {
            this.updateMetricConfig('9', e.target.value);
        });
        
        // Color inputs
        document.getElementById('config-12-color').addEventListener('change', (e) => {
            this.updateLEDColor('12', e.target.value);
        });
        
        document.getElementById('config-3-color').addEventListener('change', (e) => {
            this.updateLEDColor('3', e.target.value);
        });
        
        document.getElementById('config-6-color').addEventListener('change', (e) => {
            this.updateLEDColor('6', e.target.value);
        });
        
        document.getElementById('config-9-color').addEventListener('change', (e) => {
            this.updateLEDColor('9', e.target.value);
        });
        
        // Save configuration
        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfiguration();
        });
        
        // Fullscreen toggle
        document.getElementById('toggle-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // ESC key to exit fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.toggleFullscreen();
            }
        });
    }

    loadConfiguration() {
        const config = this.configManager.getConfig();
        
        // Load metric selections
        Object.keys(config.metrics).forEach(position => {
            const select = document.getElementById(`config-${position}-metric`);
            const colorInput = document.getElementById(`config-${position}-color`);
            
            if (select) select.value = config.metrics[position].metric;
            if (colorInput) colorInput.value = config.metrics[position].color;
            
            // Apply color immediately
            this.updateLEDColor(position, config.metrics[position].color);
        });
        
        // Load Supabase config
        const supabaseConfig = config.supabase;
        document.getElementById('supabase-url').value = supabaseConfig.url;
        document.getElementById('supabase-key').value = supabaseConfig.key || '';
        document.getElementById('supabase-table').value = supabaseConfig.table;
    }

    updateMetricConfig(position, metric) {
        const color = document.getElementById(`config-${position}-color`).value;
        this.configManager.updateMetricConfig(position, metric, color);
        this.updateDisplay(position, this.currentData);
    }

    updateLEDColor(position, color) {
        const elements = {
            '12': document.getElementById('led-display-12'),
            '3': document.getElementById('led-display-3'),
            '6': document.getElementById('led-display-6'),
            '9': [
                document.getElementById('led-gauge-fill'),
                document.getElementById('led-percent-9')
            ]
        };
        
        if (position === '9') {
            elements['9'].forEach(el => {
                if (el) {
                    el.style.stroke = color;
                    el.style.fill = color;
                }
            });
        } else {
            if (elements[position]) {
                elements[position].style.fill = color;
            }
        }
        
        // Save to config
        const metric = document.getElementById(`config-${position}-metric`).value;
        this.configManager.updateMetricConfig(position, metric, color);
    }

    async connectToSupabase() {
        // Set up callbacks
        this.supabaseManager.onData((data) => {
            this.currentData = data;
            this.updateAllDisplays(data);
        });
        
        this.supabaseManager.onStatusChange((status) => {
            this.updateConnectionStatus(status);
        });
        
        // Try to connect
        const connected = await this.supabaseManager.connect();
        
        if (!connected) {
            // Use mock data for demo
            console.log('Using mock data for demonstration');
            this.startMockDataUpdates();
        } else {
            // Start periodic updates
            this.startDataUpdates();
        }
    }

    startDataUpdates() {
        // Initial fetch
        this.fetchAndUpdateData();
        
        // Set up periodic updates
        const config = this.configManager.getConfig();
        this.updateTimer = setInterval(() => {
            this.fetchAndUpdateData();
        }, config.updateInterval || 5000);
    }

    async fetchAndUpdateData() {
        const data = await this.supabaseManager.fetchMetrics();
        if (data) {
            this.currentData = data;
            this.updateAllDisplays(data);
        }
    }

    startMockDataUpdates() {
        // Generate and display mock data
        const updateMockData = () => {
            const data = this.supabaseManager.generateMockData();
            this.currentData = data;
            this.updateAllDisplays(data);
        };
        
        updateMockData();
        this.updateTimer = setInterval(updateMockData, 5000);
    }

    updateAllDisplays(data) {
        ['12', '3', '6', '9'].forEach(position => {
            this.updateDisplay(position, data);
        });
    }

    updateDisplay(position, data) {
        const config = this.configManager.getMetricConfig(position);
        const metricDef = METRIC_DEFINITIONS[config.metric];
        
        if (!metricDef || !data) return;
        
        const value = data[metricDef.query];
        const formatted = formatValue(value, metricDef.format);
        
        if (position === '9') {
            // Update gauge
            this.updateGauge(value);
            document.getElementById('led-percent-9').textContent = `${formatted}%`;
        } else {
            const element = document.getElementById(`led-display-${position}`);
            if (element) {
                element.textContent = formatted;
            }
        }
    }

    updateGauge(percentage) {
        const value = Math.min(100, Math.max(0, percentage));
        const angle = (value / 100) * 270 - 135; // -135 to +135 degrees
        const radius = 40;
        const centerX = 180;
        const centerY = 300;
        
        const startAngle = -135 * Math.PI / 180;
        const endAngle = angle * Math.PI / 180;
        
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArc = Math.abs(angle - (-135)) > 180 ? 1 : 0;
        
        const path = `M ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2}`;
        document.getElementById('led-gauge-fill').setAttribute('d', path);
    }

    saveConfiguration() {
        const url = document.getElementById('supabase-url').value;
        const key = document.getElementById('supabase-key').value;
        const table = document.getElementById('supabase-table').value;
        
        this.configManager.updateSupabaseConfig(url, key, table);
        
        // Reconnect with new config
        this.supabaseManager.disconnect();
        this.connectToSupabase();
        
        // Show success feedback
        const button = document.getElementById('save-config');
        const originalText = button.textContent;
        button.textContent = 'Saved!';
        button.style.background = 'linear-gradient(135deg, #00ff00, #00cc00)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        const container = document.querySelector('.container');
        
        if (this.isFullscreen) {
            container.classList.add('fullscreen');
            document.getElementById('toggle-fullscreen').textContent = 'Exit Fullscreen';
        } else {
            container.classList.remove('fullscreen');
            document.getElementById('toggle-fullscreen').textContent = 'Fullscreen';
        }
    }

    addMinuteMarks() {
        const minuteMarks = document.getElementById('minute-marks');
        const radius = 240;
        const centerX = 300;
        const centerY = 300;
        
        for (let i = 0; i < 60; i++) {
            const angle = (i * 6 - 90) * Math.PI / 180;
            const x1 = centerX + (radius - 5) * Math.cos(angle);
            const y1 = centerY + (radius - 5) * Math.sin(angle);
            const x2 = centerX + radius * Math.cos(angle);
            const y2 = centerY + radius * Math.sin(angle);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', i % 5 === 0 ? '#FFA500' : '#666');
            line.setAttribute('stroke-width', i % 5 === 0 ? '2' : '1');
            
            minuteMarks.appendChild(line);
        }
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours() % 12;
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            
            const hourAngle = (hours * 30) + (minutes * 0.5);
            const minuteAngle = minutes * 6;
            const secondAngle = seconds * 6;
            
            document.getElementById('hour-hand').style.transform = `rotate(${hourAngle}deg)`;
            document.getElementById('minute-hand').style.transform = `rotate(${minuteAngle}deg)`;
            document.getElementById('second-hand').style.transform = `rotate(${secondAngle}deg)`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    createConnectionIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'connection-status';
        indicator.innerHTML = '<div class="dot"></div><span>Disconnected</span>';
        document.querySelector('.container').appendChild(indicator);
    }

    updateConnectionStatus(status) {
        const indicator = document.querySelector('.connection-status');
        const text = indicator.querySelector('span');
        
        switch (status) {
            case 'connected':
                indicator.classList.add('connected');
                text.textContent = 'Connected';
                break;
            case 'error':
                indicator.classList.remove('connected');
                text.textContent = 'Connection Error';
                break;
            default:
                indicator.classList.remove('connected');
                text.textContent = 'Disconnected';
        }
    }
    
    // 3D Interaction Setup
    setup3DInteraction() {
        const watchContainer = document.querySelector('.watch-container');
        const watch = document.getElementById('panerai-watch');
        
        let isInteracting = false;
        let mouseX = 0;
        let mouseY = 0;
        let targetRotateX = 0;
        let targetRotateY = 0;
        let currentRotateX = 0;
        let currentRotateY = 0;
        
        // Mouse interaction
        watchContainer.addEventListener('mousemove', (e) => {
            if (!isInteracting) return;
            
            const rect = watchContainer.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            mouseX = e.clientX - rect.left - centerX;
            mouseY = e.clientY - rect.top - centerY;
            
            // Calculate rotation based on mouse position
            targetRotateY = (mouseX / centerX) * 15; // Max 15 degrees
            targetRotateX = -(mouseY / centerY) * 15; // Max 15 degrees
        });
        
        watchContainer.addEventListener('mouseenter', () => {
            isInteracting = true;
        });
        
        watchContainer.addEventListener('mouseleave', () => {
            isInteracting = false;
            targetRotateX = 0;
            targetRotateY = 0;
        });
        
        // Touch interaction for mobile
        watchContainer.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = watchContainer.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            mouseX = touch.clientX - rect.left - centerX;
            mouseY = touch.clientY - rect.top - centerY;
            
            targetRotateY = (mouseX / centerX) * 15;
            targetRotateX = -(mouseY / centerY) * 15;
        });
        
        // Smooth animation loop
        const animate3D = () => {
            // Smooth interpolation
            currentRotateX += (targetRotateX - currentRotateX) * 0.1;
            currentRotateY += (targetRotateY - currentRotateY) * 0.1;
            
            // Apply transform
            watchContainer.style.setProperty('--rotateX', `${currentRotateX}deg`);
            watchContainer.style.setProperty('--rotateY', `${currentRotateY}deg`);
            
            requestAnimationFrame(animate3D);
        };
        
        animate3D();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.paneraiWatch = new PaneraiWatch();
});