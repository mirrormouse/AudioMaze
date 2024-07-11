export class ClearScreen {
    private width: number;
    private height: number;
    private distance: number = 0;
    private guessCount: number = 0;
    private isVisible: boolean = false;
    private onNextStage: () => void = () => { };
    private isFinalStage: boolean = false;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    show(distance: number, guessCount: number, onNextStage: () => void, isFinalStage: boolean) {
        this.distance = distance;
        this.guessCount = guessCount;
        this.isVisible = true;
        this.onNextStage = onNextStage;
        this.isFinalStage = isFinalStage;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!this.isVisible) return;

        // 半透明の背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.width, this.height);

        // テキスト描画
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('クリア！', this.width / 2, this.height * 0.3);

        ctx.font = '24px Arial';
        ctx.fillText(`音源との距離: ${this.distance.toFixed(2)}`, this.width / 2, this.height * 0.4);
        ctx.fillText(`推定回数: ${this.guessCount}`, this.width / 2, this.height * 0.45);

        // ボタン
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = this.width / 2 - buttonWidth / 2;
        const buttonY = this.height * 0.6 - buttonHeight;

        ctx.fillStyle = 'blue';
        ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(this.isFinalStage ? 'メニューに戻る' : '次のステージへ', this.width / 2, buttonY + buttonHeight / 2 + 7);
    }

    handleClick(x: number, y: number) {
        if (!this.isVisible) return;

        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = this.width / 2 - buttonWidth / 2;
        const buttonY = this.height * 0.6 - buttonHeight;

        if (
            x >= buttonX &&
            x <= buttonX + buttonWidth &&
            y >= buttonY &&
            y <= buttonY + buttonHeight
        ) {
            this.onNextStage();
        }
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}