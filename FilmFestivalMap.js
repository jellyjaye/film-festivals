/**
 * 电影节地图组件
 * @component
 */
class FilmFestivalMap {
  constructor() {
    // 初始化场景
    this.scene = new THREE.Scene();
    
    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 20;
    
    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xffffff);
    
    // 初始化光照系统
    this.addLights();
    
    // 创建地球
    this.createEarth();
    
    // 添加轨道控制器
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 30;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    
    // 初始化射线检测器
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // 存储标记点
    this.markers = [];
    
    // 添加事件监听
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    document.addEventListener('click', this.onDocumentClick.bind(this), false);
  }

  /**
   * 添加光照系统
   */
  addLights() {
    // 只使用强度更大的环境光，使光照更均匀
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);
    
    // 添加一个非常弱的定向光，仅提供轻微的立体感
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  /**
   * 创建地球
   */
  createEarth() {
    // 加载纹理
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('./assets/earth-texture.jpg');
    const bumpMap = textureLoader.load('./assets/earth-bump.jpg');
    
    // 提高纹理质量
    earthTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    earthTexture.minFilter = THREE.LinearFilter;
    earthTexture.magFilter = THREE.LinearFilter;
    bumpMap.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
    // 创建地球网格
    const geometry = new THREE.SphereGeometry(5, 128, 128);
    const material = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: bumpMap,
        bumpScale: 0.1,
        shininess: 5,
        specular: 0x111111
    });
    
    this.earth = new THREE.Mesh(geometry, material);
    
    // 调整地球初始旋转
    this.earth.rotation.y = 0;
    
    this.scene.add(this.earth);
  }

  /**
   * 窗口大小调整处理
   */
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
  }

  /**
   * 将经纬度转换为三维坐标
   * @param {number} lat - 纬度
   * @param {number} lng - 经度
   * @returns {THREE.Vector3}
   */
  latLongToVector3(lat, lng) {
    const radius = 5;
    // 将经纬度转换为弧度
    const phi = lat * (Math.PI / 180);
    const theta = -lng * (Math.PI / 180);

    // 球面坐标转换为笛卡尔坐标
    return new THREE.Vector3(
        radius * Math.cos(phi) * Math.cos(theta),
        radius * Math.sin(phi),
        radius * Math.cos(phi) * Math.sin(theta)
    );
  }

  /**
   * 加载电影节数据
   * @returns {Promise<Array>} 返回解析后的电影节数据
   */
  async loadFestivalData() {
    try {
        console.log('开始加载 CSV 数据...');
        const response = await fetch('./data/film-festivals.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        console.log('CSV 数据加载成功');
        
        // 解析CSV
        const rows = csvText.split('\n').slice(1); // 跳过表头
        console.log(`解析到 ${rows.length} 条数据`);
        
        const festivals = rows
            .filter(row => row.trim() !== '') // 过滤空行
            .map(row => {
                const columns = row.split(',');
                return {
                    id: parseInt(columns[0]),
                    name: columns[1],
                    name_en: columns[2],
                    latitude: parseFloat(columns[3]),
                    longitude: parseFloat(columns[4]),
                    description: columns[5],
                    description_en: columns[6],
                    date: columns[7],
                    website: columns[8],
                    country: columns[9],
                    category: columns[10],
                    founded_year: parseInt(columns[11]),
                    awards: columns[12]
                };
            })
            .filter(festival => 
                festival.id && 
                !isNaN(festival.latitude) && 
                !isNaN(festival.longitude)
            );
        
        console.log(`成功处理 ${festivals.length} 个电影节数据`);
        return festivals;
        
    } catch (error) {
        console.error('加载电影节数据时出错:', error);
        console.error('错误详情:', error.message);
        console.error('错误堆栈:', error.stack);
        throw error;
    }
  }

  /**
   * 添加电影节标记点
   */
  addFestivalMarkers(festivals) {
    festivals.forEach(festival => {
      // 创建标记点
      const markerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const markerMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xC0C0C0,
        emissive: 0x808080,
        emissiveIntensity: 0.5,
        shininess: 100,
        specular: 0xFFFFFF
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      // 计算位置
      const position = this.latLongToVector3(festival.latitude, festival.longitude);
      position.multiplyScalar(1.01);
      marker.position.copy(position);
      
      // 添加到场景
      marker.userData = festival;
      this.markers.push(marker);
      this.scene.add(marker);

      // 添加光晕
      const glowGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(position);
      this.scene.add(glow);
    });
  }

  /**
   * 处理点击事件
   */
  onDocumentClick(event) {
    event.preventDefault();

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.markers);

    if (intersects.length > 0) {
      const marker = intersects[0].object;
      this.showPopup(marker.userData, event.clientX, event.clientY);
    }
  }

  /**
   * 显示弹窗
   */
  showPopup(festival, x, y) {
    const popup = new FestivalPopup(festival);
    const popupElement = popup.render();
    
    popupElement.style.left = `${x}px`;
    popupElement.style.top = `${y}px`;
    
    const oldPopup = document.querySelector('.festival-popup');
    if (oldPopup) {
      oldPopup.remove();
    }
    
    document.body.appendChild(popupElement);
  }

  /**
   * 动画更新
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}