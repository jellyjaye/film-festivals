/**
 * 电影节弹窗组件
 */
class FestivalPopup {
    /**
     * @param {Object} festival - 电影节数据
     * @param {boolean} isFavorited - 是否已收藏
     */
    constructor(festival, isFavorited = false) {
      this.festival = festival;
      this.isFavorited = isFavorited;
    }
  
    /**
     * 渲染弹窗内容
     * @returns {HTMLElement}
     */
    render() {
      const popup = document.createElement('div');
      popup.className = 'festival-popup';
      
      popup.innerHTML = `
        <div class="popup-close">×</div>
        <div class="title-container">
          <h3>${this.festival.name}</h3>
          <div class="favorite-btn ${this.isFavorited ? 'active' : ''}" 
               onclick="this.classList.toggle('active')">
            ❤
          </div>
        </div>
        <p>${this.festival.description}</p>
        <div class="festival-details">
          <p><strong>举办时间：</strong>${this.festival.date}</p>
          <p><strong>官方网站：</strong><a href="https://${this.festival.website}" target="_blank" rel="noopener noreferrer">${this.festival.website}</a></p>
          <p><strong>创办年份：</strong>${this.festival.founded_year}</p>
          <p><strong>电影节类别：</strong>${this.festival.category}</p>
          <p><strong>主要奖项：</strong>${this.festival.awards}</p>
        </div>
      `;
  
      // 添加关闭按钮事件监听
      const closeButton = popup.querySelector('.popup-close');
      closeButton.addEventListener('click', () => {
        popup.remove();
      });
  
      // 添加链接点击事件处理
      const link = popup.querySelector('a');
      link.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
      });
  
      // 添加收藏按钮事件监听
      const favoriteBtn = popup.querySelector('.favorite-btn');
      favoriteBtn.addEventListener('click', (event) => {
        event.stopPropagation(); // 阻止事件冒泡
        this.isFavorited = !this.isFavorited;
        favoriteBtn.classList.toggle('active');
        // 这里可以添加收藏功能的具体实现
      });
  
      // 防止点击弹窗内容时关闭
      popup.addEventListener('click', (event) => {
        event.stopPropagation();
      });
  
      return popup;
    }
  
    /**
     * 移除弹窗
     */
    remove() {
      const popup = document.querySelector('.festival-popup');
      if (popup) {
        popup.remove();
      }
    }
  
    /**
     * 更新弹窗位置
     * @param {number} x - 横坐标
     * @param {number} y - 纵坐标
     */
    updatePosition(x, y) {
      const popup = document.querySelector('.festival-popup');
      if (popup) {
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
      }
    }
  }