class AdClickManager {
    constructor() {
        this.FREE_LIMIT = 3; // 첫 3회 무료
        this.USAGE_KEY = 'gif_convert_usage';
        this.adModal = document.getElementById('ad-modal');
        this.mockAd = document.getElementById('mock-ad');

        // 초기화
        this.init();
    }

    init() {
        let usage = localStorage.getItem(this.USAGE_KEY);
        if (!usage) {
            localStorage.setItem(this.USAGE_KEY, '0');
        }

        // 배너를 클릭하면 이동하도록 하는 처리 (실제 쿠팡파트너스나 기타 광고의 경우 새 창이 뜸)
        if (this.mockAd) {
            this.mockAd.addEventListener('click', () => {
                this.handleAdClicked();
            });
        }

        // iframe blur 이벤트 감지 (구글 애드센스 등 서드파티 광고 클릭 감지용)
        window.addEventListener('blur', () => {
            if (this.adModal && !this.adModal.classList.contains('hidden')) {
                // 사용자가 모달 창 위에 마우스를 둔 상태에서 blur가 발생했다면 광고 클릭으로 간주
                const activeEl = document.activeElement;
                if (activeEl && activeEl.tagName === 'IFRAME' || activeEl.id === 'ad-container') {
                    // 약간의 딜레이 후 처리 (모달 띄운 상태로 이동하기 위함)
                    setTimeout(() => this.handleAdClicked(), 500);
                }
            }
        });
    }

    getUsage() {
        return parseInt(localStorage.getItem(this.USAGE_KEY) || '0', 10);
    }

    incrementUsage() {
        let usage = this.getUsage();
        usage++;
        localStorage.setItem(this.USAGE_KEY, usage.toString());
        console.log(`현재 변환 사용량: ${usage}`);
    }

    canConvertFree() {
        return this.getUsage() < this.FREE_LIMIT;
    }

    showAdModal(onResolved) {
        this.adModal.classList.remove('hidden');
        this.onResolved = onResolved; // 광고 클릭 후 실행할 콜백
    }

    hideAdModal() {
        this.adModal.classList.add('hidden');
    }

    handleAdClicked() {
        console.log('광고 시청(클릭) 확인되었습니다.');

        // 보상 지급: 사용량을 초기화하거나 리밋을 늘려줌 (여기서는 리셋)
        localStorage.setItem(this.USAGE_KEY, '0');

        this.hideAdModal();

        // 주의: 디자인상 alert 창이 뜨면 흐름이 뚝 끊기기 때문에 애니메이션이 다 닫힐 때(300ms 이후) 콜백 실행
        if (this.onResolved) {
            setTimeout(() => {
                this.onResolved();
                this.onResolved = null;
            }, 300);
        }
    }
}

// 전역에서 사용할 수 있도록 생성
const adManager = new AdClickManager();
