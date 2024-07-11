export class FailureNotification {
    private width: number;
    private height: number;
    private isVisible: boolean = false;
    private guessCount: number = 0;
    private distance: number = 0;
    private threshold: number = 0;
    private isPortrait: boolean;
    private buttonX: number = 0;
    private buttonY: number = 0;
    private buttonWidth: number = 150;  // ボタンの幅を大きく
    private buttonHeight: number = 60;  // ボタンの高さを大きく

    constructor(width: number, height: number, isPortrait: boolean) {
        this.width = width;
        this.height = height;
        this.isPortrait = isPortrait;
        this.updateButtonPosition();
    }

    show(guessCount: number, distance: number, threshold: number) {
        this.isVisible = true;
        this.guessCount = guessCount;
        this.distance = distance;
        this.threshold = threshold;
        this.updateButtonPosition();
    }

    hide() {
        this.isVisible = false;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.isVisible) return;

        // 半透明の背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.width, this.height);

        this.drawNotification(ctx);

        // OKボタン
        this.drawButton(ctx, 'OK', this.buttonX, this.buttonY);
    }

    private drawNotification(ctx: CanvasRenderingContext2D) {
        const boxWidth = this.isPortrait ? this.width * 0.8 : this.width * 0.3;  // 横長の場合、幅を少し狭く
        const boxHeight = this.isPortrait ? this.height * 0.5 : this.height * 0.5;  // 横長の場合、高さを少し高く
        const boxX = this.isPortrait ? (this.width - boxWidth) / 2 : (this.width - boxWidth) / 2;
        const boxY = this.isPortrait ? this.height * 0.6 - boxHeight : (this.height - boxHeight) / 2;

        // 通知ボックス
        ctx.fillStyle = 'white';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // テキスト描画
        ctx.fillStyle = 'red';
        ctx.font = 'bold 48px Arial';  // フォントサイズを大きく
        ctx.textAlign = 'center';
        ctx.fillText('失敗', this.width / 2, boxY + 70);  // 位置を調整

        ctx.fillStyle = 'black';
        ctx.font = this.isPortrait ? '24px Arial' : '32px Arial';  // フォントサイズを大きく

        const lineHeight = this.isPortrait ? 40 : 50;  // 行間を広く
        const startY = boxY + 140;  // 開始位置を下げる

        ctx.fillText(`推定回数: ${this.guessCount}`, this.width / 2, startY);
        ctx.fillText(`音源までの距離: ${this.distance.toFixed(2)}`, this.width / 2, startY + lineHeight);
        ctx.fillText(`目標距離: ${this.threshold}`, this.width / 2, startY + lineHeight * 2);
    }

    private drawButton(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
        ctx.fillStyle = '#3498db';
        ctx.fillRect(x - this.buttonWidth / 2, y - this.buttonHeight / 2, this.buttonWidth, this.buttonHeight);

        ctx.fillStyle = 'white';
        ctx.font = '28px Arial';  // フォントサイズを大きく
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }


    handleClick(x: number, y: number): boolean {

        if (!this.isVisible) return false;
        this.updateButtonPosition();

        if (
            x >= this.buttonX - this.buttonWidth / 2 &&
            x <= this.buttonX + this.buttonWidth / 2 &&
            y >= this.buttonY - this.buttonHeight / 2 &&
            y <= this.buttonY + this.buttonHeight / 2
        ) {
            this.hide();
            return true;
        }

        return false;
    }

    resize(width: number, height: number, isPortrait: boolean) {
        this.width = width;
        this.height = height;
        this.isPortrait = isPortrait;
        this.updateButtonPosition();
    }

    private updateButtonPosition() {
        const boxHeight = this.isPortrait ? this.height * 0.5 : this.height * 0.5;
        const boxY = this.isPortrait ? (this.height - boxHeight) / 4 : (this.height - boxHeight) / 2;
        this.buttonX = this.width / 2;
        this.buttonY = this.isPortrait
            ? (boxY + boxHeight * 0.8)   // 縦長の場合、ボタンの位置を調整
            : (boxY + boxHeight * 0.8);
    }
}