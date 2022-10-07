import { CircuitComponent, ClassicalMeasureComponent, ClassicalSourceComponent, QuantumMeasureComponent } from "./Circuit"
import { View } from "./View";

abstract class DetailsView {
    protected owningComponent: CircuitComponent;

    protected x: number;
    protected y: number;

    protected width: number;
    protected height: number;

    public static createFor(owningComponent: CircuitComponent, x: number, y: number): DetailsView | null {
        if(owningComponent.getComponentId() == 0)
            return new ClassicalSourceDetailsView(owningComponent, x, y);
        if(owningComponent.getComponentId() == 17)
            return new ClassicalMeasureDetailsView(owningComponent, x, y);
        if(owningComponent.getComponentId() == 18)
            return new QuantumMeasureDetailsView(owningComponent, x, y);
        return null;
    }

    public constructor(owningComponent: CircuitComponent, x: number, y: number, width: number, height: number) {
        this.owningComponent = owningComponent;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public render(view: View): void {
        const ctx = view.getDrawingContext();

        ctx.save();

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }

    public mouseClick(x: number, y: number): void { }
    public keyDown(keyCode: string): void { }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }
}

class ClassicalSourceDetailsView extends DetailsView {

    private boxX;
    private boxY;
    private boxW;
    private boxH;

    public constructor(owningComponent: CircuitComponent, x: number, y: number) {
        super(owningComponent, x, y, 300, 200);

        this.boxX = this.width * 0.2;
        this.boxY = this.height * 0.25;
        this.boxW = this.width * 0.6;
        this.boxH = this.height * 0.5;
    }

    public override render(view: View): void {
        super.render(view);

        const sliderW = this.width * 0.15;
        const sliderH = this.boxH - 8;
        const sliderX = (this.owningComponent as ClassicalSourceComponent).isOn() ? this.boxX + this.boxW - 4 - sliderW : this.boxX + 4;
        const sliderY = this.boxY + 4;

        const ctx = view.getDrawingContext();

        ctx.save();

        ctx.fillStyle = (this.owningComponent as ClassicalSourceComponent).isOn() ? "#00cc00" : "#555555";
        ctx.fillRect(this.x + this.boxX, this.y + this.boxY, this.boxW, this.boxH);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + this.boxX, this.y + this.boxY, this.boxW, this.boxH);

        ctx.fillStyle = "#cccccc";
        ctx.fillRect(this.x + sliderX, this.y + sliderY, sliderW, sliderH);
        ctx.strokeRect(this.x + sliderX, this.y + sliderY, sliderW, sliderH);

        ctx.restore();
    }

    public override mouseClick(x: number, y: number): void {
        x -= this.x;
        y -= this.y;

        if(x >= this.boxX && x < this.boxX + this.boxW && y >= this.boxY && y < this.boxY + this.boxH)
            (this.owningComponent as ClassicalSourceComponent).setOn(!(this.owningComponent as ClassicalSourceComponent).isOn());
    }
}

class ClassicalMeasureDetailsView extends DetailsView {

    private boxX;
    private boxY;
    private boxW;
    private boxH;

    public constructor(owningComponent: CircuitComponent, x: number, y: number) {
        super(owningComponent, x, y, 300, 200);

        this.boxX = this.width * 0.2;
        this.boxY = this.height * 0.25;
        this.boxW = this.width * 0.6;
        this.boxH = this.height * 0.5;
    }

    public override render(view: View): void {
        super.render(view);

        const ctx = view.getDrawingContext();

        ctx.save();

        ctx.fillStyle = (this.owningComponent as ClassicalMeasureComponent).getResult() ? "#00cc00" : "#555555";
        ctx.fillRect(this.x + this.boxX, this.y + this.boxY, this.boxW, this.boxH);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + this.boxX, this.y + this.boxY, this.boxW, this.boxH);

        ctx.fillStyle = "#ffffff";
        ctx.font = "75px Calibri";
        ctx.textBaseline = "middle";
        const text = (this.owningComponent as ClassicalMeasureComponent).getResult() ? "1" : "0";
        const textWidth = ctx.measureText(text).width;
        ctx.fillText(text, this.x + this.width / 2 - textWidth / 2, this.y + this.boxY + this.boxH / 2);
        

        ctx.restore();
    }
}

class QuantumMeasureDetailsView extends DetailsView {

    private boxX;
    private boxY;
    private boxW;
    private boxH;

    private textWidths: number[] = [];
    private owningMeasure: QuantumMeasureComponent;

    public constructor(owningComponent: CircuitComponent, x: number, y: number) {
        super(owningComponent, x, y, 400, 300);

        this.owningMeasure = owningComponent as QuantumMeasureComponent;

        this.boxX = this.width * 0.1;
        this.boxY = this.height * 0.3;
        this.boxW = this.width * 0.8;
        this.boxH = this.height * 0.6;
    }

    public override render(view: View): void {
        super.render(view);

        const ctx = view.getDrawingContext();

        ctx.save();

        const buckets = this.owningMeasure.getBuckets();

        this.drawHistogram(ctx, buckets);
        this.drawGroupSelection(ctx);
        

        ctx.restore();
    }

    private drawGroupSelection(ctx: CanvasRenderingContext2D): void {
        if(this.textWidths.length == 0) {
            ctx.font = "bold 15px Courier";
            this.textWidths = ["BLUE Group", "RED Group", "GREEN Group"].map((group) => ctx.measureText(group).width);
        }

        const group = this.owningMeasure.getMeasureGroup();

        ctx.textBaseline = "top";
        ctx.fillStyle = "#000000";
        ctx.font = "bold 15px Courier";

        let bbox = this.getGroupBoundingBox(1);
        if(group == 1) {
            ctx.strokeStyle = "#2d85c5"
            ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
        }
        ctx.fillText("BLUE Group", bbox[0] + 5, bbox[1] + 5);

        bbox = this.getGroupBoundingBox(2);
        if(group == 2) {
            ctx.strokeStyle = "#fe3902"
            ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
        }
        ctx.fillText("RED Group", bbox[0] + 5, bbox[1] + 5);

        bbox = this.getGroupBoundingBox(3);
        if(group == 3) {
            ctx.strokeStyle = "#48a88c"
            ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
        }
        ctx.fillText("GREEN Group", bbox[0] + 5, bbox[1] + 5);
    }

    private getGroupBoundingBox(group: number): number[] {
        const w = this.textWidths[group - 1];
        const textY = this.y + 25;
        const textX = group == 1 ? this.x + 10 : group == 2 ? this.x + this.width / 2 - w / 2 - 5 : this.x + this.width - 15 - w - 5;

        return [textX, textY, w + 10, 25];
    }

    private drawHistogram(ctx: CanvasRenderingContext2D, buckets: number[]): void {
        let n = buckets.length;
        let labels = [""];
        while (n > 1) {
            labels = labels.map((label) => [label + "0", label + "1"]).flat();
            n = n / 2;
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + this.boxX, this.y + this.boxY, this.boxW, this.boxH);

        const bottom = this.y + this.boxY + this.boxH;
        const left = this.x + this.boxX;

        const lineY = bottom - 0.15*this.boxH;
        const diagramHeight = lineY - this.y - this.boxY - 10;

        ctx.beginPath();
        ctx.moveTo(left + 10, lineY);
        ctx.lineTo(left + this.boxW - 10, lineY);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = "#add8e6";
        for(let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(left + 10, lineY - diagramHeight / 4 * (i + 1));
            ctx.lineTo(left + this.boxW - 10, lineY - diagramHeight / 4 * (i + 1));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = "#000000";

        const colours = this.owningMeasure.getMeasureGroup() == 1 ? ["#2d85c5", "#61bdee"]
            : this.owningMeasure.getMeasureGroup() == 2 ? ["#fe3902", "#ffb403"]
            : this.owningMeasure.getMeasureGroup() == 3 ? ["#48a88c", "#aadea7"]
            : ["#555555", "#999999"]
        
        
        const gridXWidth = (this.boxW - 20) /buckets.length;
        for(let i = 0; i < buckets.length; i++) {
            ctx.fillStyle = colours[i % 2];
            const barHeight = diagramHeight*buckets[i];
            ctx.fillRect(left + 10 + gridXWidth * i, lineY - barHeight, gridXWidth, barHeight);

            ctx.beginPath();
            ctx.moveTo(left + 10 + gridXWidth * (i + 0.5), lineY + 5);
            ctx.lineTo(left + 10 + gridXWidth * (i + 0.5), lineY - 5);
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = "#000000";
            ctx.font = "15px Calibri";
            ctx.textBaseline = "top";
            const textWidth = ctx.measureText(labels[i]);
            ctx.fillText(labels[i], left + 10 + gridXWidth * (i + 0.5) - textWidth.width / 2, lineY + 6);

        }

    }

    public override mouseClick(x: number, y: number): void {
        for(let i = 1; i <= 3; i++) {
            const bbox = this.getGroupBoundingBox(i);
            if(x >= bbox[0] && x < bbox[0] + bbox[2] && y >= bbox[1] && y < bbox[1] + bbox[3]) {
                this.owningMeasure.setMeasureGroup(this.owningMeasure.getMeasureGroup() == i ? 0 : i);
            }
        }
    }
}

export { DetailsView }