/**
 * 电影节弹窗组件
 * @class FestivalPopup
 */
class FestivalPopup {
  /**
   * @param {Object} festival - 电影节数据
   * @param {boolean} isFavorited - 是否已收藏
   */
  constructor(festival, isFavorited = false) {
      this.festival = festival;
      this.isFavorited = isFavorited;
      // 缓存创建的弹窗元素
      this.popupElement = null;
  }

  /**
   * 渲染弹窗内容
   * @returns {HTMLElement}
   */
  render() {
      // 如果已经存在弹窗，先移除
      this.remove();

      // 使用 DocumentFragment 提升性能
      const fragment = document.createDocumentFragment();
      this.popupElement = document.createElement('div');
      this.popupElement.className = 'festival-popup loading';

      // 使用模板字符串一次性创建内容
      const content = `
          <div class="popup-header">
              <h3>${this.festival.name}</h3>
              <div class="popup-close">×</div>
          </div>
          <div class="popup-content">
              <p class="description">${this.festival.description}</p>
              <div class="festival-details">
                  <p><strong>举办时间：</strong>${this.festival.date}</p>
                  <p><strong>创办年份：</strong>${this.festival.founded_year}</p>
                  <p><strong>电影节类别：</strong>${this.festival.category}</p>
                  <p><strong>主要奖项：</strong>${this.festival.awards}</p>
                  <p class="website"><strong>官方网站：</strong>
                      <a href="https://${this.festival.website}" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         class="website-link">${this.festival.website}</a>
                  </p>
              </div>
              <div class="favorite-btn ${this.isFavorited ? 'active' : ''}" 
                   role="button" 
                   aria-label="收藏">❤</div>
          </div>
      `;

      this.popupElement.innerHTML = content;

      // 使用事件委托优化事件监听
      this.popupElement.addEventListener('click', this.handleClick.bind(this));

      // 添加到 DocumentFragment
      fragment.appendChild(this.popupElement);

      // 添加到文档
      document.body.appendChild(fragment);

      // 使用 requestAnimationFrame 优化动画
      requestAnimationFrame(() => {
          this.popupElement.classList.remove('loading');
          this.popupElement.classList.add('loaded');
      });

      return this.popupElement;
  }

  /**
   * 处理点击事件
   * @param {Event} event 
   */
  handleClick(event) {
      const target = event.target;

      if (target.classList.contains('popup-close')) {
          this.remove();
      } else if (target.classList.contains('favorite-btn')) {
          this.toggleFavorite(target);
      } else if (target.classList.contains('website-link')) {
          event.stopPropagation();
          return true; // 允许链接正常打开
      }

      event.stopPropagation();
  }

  /**
   * 切换收藏状态
   * @param {HTMLElement} button 
   */
  toggleFavorite(button) {
      this.isFavorited = !this.isFavorited;
      button.classList.toggle('active');
      // 这里可以添加收藏功能的具体实现
  }

  /**
   * 移除弹窗
   */
  remove() {
      if (this.popupElement && this.popupElement.parentNode) {
          this.popupElement.classList.add('removing');
          // 添加淡出动画
          setTimeout(() => {
              this.popupElement.parentNode.removeChild(this.popupElement);
          }, 200);
      }
  }
}