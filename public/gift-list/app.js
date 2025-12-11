/* eslint-disable class-methods-use-this */
/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
/* eslint-disable no-alert */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-new */

class GiftListApp {
  constructor() {
    this.currentListId = null;
    this.currentEditGiftId = null;
    this.currentClaimGiftId = null;
    this.creatorToken = this.getOrCreateCreatorToken();
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkURLParams();
  }

  getOrCreateCreatorToken() {
    let token = localStorage.getItem('creator_token');
    if (!token) {
      token = `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('creator_token', token);
    }
    return token;
  }

  generateHash(input) {
    let hash = 0;
    const str = input + Date.now();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    const hashStr = Math.abs(hash).toString(36);
    return hashStr.substring(0, 8);
  }

  bindEvents() {
    document.getElementById('createForm').addEventListener('submit', e => {
      e.preventDefault();
      this.createList();
    });

    document.getElementById('addGiftForm').addEventListener('submit', e => {
      e.preventDefault();
      this.addGift();
    });

    document.getElementById('claimForm').addEventListener('submit', e => {
      e.preventDefault();
      this.claimGift();
    });

    document.getElementById('editGiftForm').addEventListener('submit', e => {
      e.preventDefault();
      this.saveEditGift();
    });

    document.getElementById('copyLinkBtn').addEventListener('click', () => {
      this.copyShareLink();
    });

    document.getElementById('backToCreate').addEventListener('click', () => {
      this.showCreateView();
    });

    document.getElementById('viewExistingLink').addEventListener('click', e => {
      e.preventDefault();
      this.promptForExistingList();
    });

    document.getElementById('cancelClaim').addEventListener('click', () => {
      this.hideModal('claimModal');
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
      this.hideModal('editModal');
    });

    document.getElementById('claimModal').addEventListener('click', e => {
      if (e.target.id === 'claimModal') {
        this.hideModal('claimModal');
      }
    });

    document.getElementById('editModal').addEventListener('click', e => {
      if (e.target.id === 'editModal') {
        this.hideModal('editModal');
      }
    });
  }

  checkURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const listId = urlParams.get('list');

    if (listId) {
      this.loadList(listId);
    } else {
      this.showCreateView();
    }
  }

  createList() {
    const title = document.getElementById('listTitle').value.trim();
    const celebrant = document.getElementById('celebrantName').value.trim();
    const date = document.getElementById('birthdayDate').value;

    if (!title) {
      this.showToast('请输入清单标题', 'error');
      return;
    }

    if (!celebrant) {
      this.showToast('请输入寿星姓名', 'error');
      return;
    }

    if (!date) {
      this.showToast('请选择生日日期', 'error');
      return;
    }

    const listId = this.generateHash(title + celebrant + date);

    const listData = {
      id: listId,
      title,
      celebrant,
      date,
      creatorToken: this.creatorToken,
      createdAt: Date.now(),
      gifts: []
    };

    localStorage.setItem(`gift_list_${listId}`, JSON.stringify(listData));

    const newUrl = `${window.location.pathname}?list=${listId}`;
    window.history.pushState({}, '', newUrl);

    this.currentListId = listId;
    this.loadList(listId);

    this.showToast('清单创建成功！', 'success');
  }

  loadList(listId) {
    const listData = this.getListData(listId);

    if (!listData) {
      this.showToast('清单不存在', 'error');
      this.showCreateView();
      return;
    }

    this.currentListId = listId;
    const isCreator = this.isCreator(listData);

    document.getElementById('listTitle').textContent = listData.title;
    document.getElementById('listCelebrant').textContent = listData.celebrant;
    document.getElementById('listDate').textContent = this.formatDate(listData.date);

    const shareUrl = `${window.location.origin}${window.location.pathname}?list=${listId}`;
    document.getElementById('shareLink').value = shareUrl;

    if (isCreator) {
      document.getElementById('addGiftSection').classList.remove('hidden');
    } else {
      document.getElementById('addGiftSection').classList.add('hidden');
    }

    this.renderGifts(listData.gifts, isCreator);
    this.showListView();
  }

  renderGifts(gifts, isCreator) {
    const giftsList = document.getElementById('giftsList');
    const emptyState = document.getElementById('emptyState');

    if (!gifts || gifts.length === 0) {
      giftsList.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    giftsList.innerHTML = '';

    gifts.forEach(gift => {
      const giftCard = this.createGiftCard(gift, isCreator);
      giftsList.appendChild(giftCard);
    });
  }

  createGiftCard(gift, isCreator) {
    const card = document.createElement('div');
    card.className = `gift-card ${gift.claimedBy ? 'claimed' : ''}`;

    const header = document.createElement('div');
    header.className = 'gift-card-header';

    const info = document.createElement('div');
    info.className = 'gift-info';

    const name = document.createElement('h3');
    name.textContent = gift.name || '未命名礼物';
    info.appendChild(name);

    if (gift.price) {
      const price = document.createElement('div');
      price.className = 'gift-price';
      price.textContent = `¥${Number.parseFloat(gift.price).toFixed(2)}`;
      info.appendChild(price);
    }

    header.appendChild(info);

    if (isCreator) {
      const actions = document.createElement('div');
      actions.className = 'gift-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-icon';
      editBtn.innerHTML = '✏️';
      editBtn.title = '编辑';
      editBtn.addEventListener('click', () => this.editGift(gift.id));
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-icon delete';
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = '删除';
      deleteBtn.addEventListener('click', () => this.deleteGift(gift.id));
      actions.appendChild(deleteBtn);

      header.appendChild(actions);
    }

    card.appendChild(header);

    const details = document.createElement('div');
    details.className = 'gift-details';

    if (gift.link) {
      const linkDetail = document.createElement('div');
      linkDetail.className = 'gift-detail';
      linkDetail.innerHTML = `<strong>链接：</strong><a href="${gift.link}" target="_blank" rel="noopener">${gift.link}</a>`;
      details.appendChild(linkDetail);
    }

    if (gift.note) {
      const noteDetail = document.createElement('div');
      noteDetail.className = 'gift-detail';
      noteDetail.innerHTML = `<strong>备注：</strong><span>${gift.note}</span>`;
      details.appendChild(noteDetail);
    }

    if (details.children.length > 0) {
      card.appendChild(details);
    }

    const status = document.createElement('div');
    if (gift.claimedBy) {
      status.className = 'gift-status claimed';
      status.textContent = `✓ 已被 ${gift.claimedBy} 认领`;
    } else {
      status.className = 'gift-status available';
      status.textContent = '点击认领';
      status.addEventListener('click', () => this.showClaimModal(gift.id, gift.name));
    }
    card.appendChild(status);

    return card;
  }

  addGift() {
    const name = document.getElementById('giftName').value.trim();
    const price = document.getElementById('giftPrice').value;
    const link = document.getElementById('giftLink').value.trim();
    const note = document.getElementById('giftNote').value.trim();

    if (!name && !price && !link && !note) {
      this.showToast('请至少填写一项礼物信息', 'error');
      return;
    }

    const listData = this.getListData(this.currentListId);
    if (!listData) {
      this.showToast('清单不存在', 'error');
      return;
    }

    if (!this.isCreator(listData)) {
      this.showToast('只有创建者可以添加礼物', 'error');
      return;
    }

    const giftId = `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const gift = {
      id: giftId,
      name: name || '未命名礼物',
      price: price ? Number.parseFloat(price) : null,
      link: link || null,
      note: note || null,
      claimedBy: null
    };

    listData.gifts.push(gift);
    this.saveListData(this.currentListId, listData);

    document.getElementById('addGiftForm').reset();

    this.renderGifts(listData.gifts, true);
    this.showToast('礼物添加成功！', 'success');
  }

  editGift(giftId) {
    const listData = this.getListData(this.currentListId);
    const gift = listData.gifts.find(g => g.id === giftId);

    if (!gift) {
      this.showToast('礼物不存在', 'error');
      return;
    }

    this.currentEditGiftId = giftId;

    document.getElementById('editGiftName').value = gift.name || '';
    document.getElementById('editGiftPrice').value = gift.price || '';
    document.getElementById('editGiftLink').value = gift.link || '';
    document.getElementById('editGiftNote').value = gift.note || '';

    this.showModal('editModal');
  }

  saveEditGift() {
    const listData = this.getListData(this.currentListId);
    const giftIndex = listData.gifts.findIndex(g => g.id === this.currentEditGiftId);

    if (giftIndex === -1) {
      this.showToast('礼物不存在', 'error');
      return;
    }

    const name = document.getElementById('editGiftName').value.trim();
    const price = document.getElementById('editGiftPrice').value;
    const link = document.getElementById('editGiftLink').value.trim();
    const note = document.getElementById('editGiftNote').value.trim();

    listData.gifts[giftIndex] = {
      ...listData.gifts[giftIndex],
      name: name || '未命名礼物',
      price: price ? Number.parseFloat(price) : null,
      link: link || null,
      note: note || null
    };

    this.saveListData(this.currentListId, listData);
    this.renderGifts(listData.gifts, true);
    this.hideModal('editModal');
    this.showToast('礼物更新成功！', 'success');
  }

  deleteGift(giftId) {
    if (!confirm('确定要删除这个礼物吗？')) {
      return;
    }

    const listData = this.getListData(this.currentListId);
    listData.gifts = listData.gifts.filter(g => g.id !== giftId);

    this.saveListData(this.currentListId, listData);
    this.renderGifts(listData.gifts, true);
    this.showToast('礼物已删除', 'success');
  }

  showClaimModal(giftId, giftName) {
    this.currentClaimGiftId = giftId;
    document.getElementById('claimGiftName').textContent = `礼物：${giftName || '未命名礼物'}`;
    document.getElementById('claimerName').value = '';
    this.showModal('claimModal');
  }

  claimGift() {
    const claimerName = document.getElementById('claimerName').value.trim();

    if (!claimerName) {
      this.showToast('请输入你的姓名', 'error');
      return;
    }

    const listData = this.getListData(this.currentListId);
    const giftIndex = listData.gifts.findIndex(g => g.id === this.currentClaimGiftId);

    if (giftIndex === -1) {
      this.showToast('礼物不存在', 'error');
      return;
    }

    const gift = listData.gifts[giftIndex];

    if (gift.claimedBy) {
      this.showToast(`该礼物已被 ${gift.claimedBy} 认领`, 'error');
      this.hideModal('claimModal');
      return;
    }

    listData.gifts[giftIndex].claimedBy = claimerName;
    listData.gifts[giftIndex].claimedAt = Date.now();

    this.saveListData(this.currentListId, listData);

    const isCreator = this.isCreator(listData);
    this.renderGifts(listData.gifts, isCreator);

    this.hideModal('claimModal');
    this.showToast('认领成功！', 'success');
  }

  copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.select();
    shareLinkInput.setSelectionRange(0, 99999);

    try {
      navigator.clipboard
        .writeText(shareLinkInput.value)
        .then(() => {
          this.showToast('链接已复制到剪贴板！', 'success');
        })
        .catch(() => {
          document.execCommand('copy');
          this.showToast('链接已复制到剪贴板！', 'success');
        });
    } catch (err) {
      this.showToast('复制失败，请手动复制', 'error');
    }
  }

  promptForExistingList() {
    const listId = prompt('请输入清单ID（从链接中获取）：');
    if (listId) {
      const newUrl = `${window.location.pathname}?list=${listId}`;
      window.history.pushState({}, '', newUrl);
      this.loadList(listId);
    }
  }

  getListData(listId) {
    const data = localStorage.getItem(`gift_list_${listId}`);
    return data ? JSON.parse(data) : null;
  }

  saveListData(listId, data) {
    localStorage.setItem(`gift_list_${listId}`, JSON.stringify(data));
  }

  isCreator(listData) {
    return listData.creatorToken === this.creatorToken;
  }

  showCreateView() {
    document.getElementById('createView').classList.remove('hidden');
    document.getElementById('listView').classList.add('hidden');
    window.history.pushState({}, '', window.location.pathname);
    document.getElementById('createForm').reset();
  }

  showListView() {
    document.getElementById('createView').classList.add('hidden');
    document.getElementById('listView').classList.remove('hidden');
  }

  showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
  }

  hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GiftListApp();
});
