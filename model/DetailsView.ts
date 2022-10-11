import { AreaComponent, CircuitComponent, ClassicalMeasureComponent, ClassicalSourceComponent, ControlledRComponent, QuantumMeasureComponent, RComponent, TextComponent } from "./Circuit"
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
        if(owningComponent.getComponentId() == 25)
            return new RThetaDetailsView(owningComponent, x, y, owningComponent as RComponent, null);
        if(owningComponent.getComponentId() == 26)
            return new RThetaDetailsView(owningComponent, x, y, null, owningComponent as ControlledRComponent);
        if(owningComponent.getComponentId() == 29)
            return new TextDetailsView(owningComponent, x, y);
        if(owningComponent.getComponentId() == 30)
            return new AreaDetailsView(owningComponent, x, y);
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
    public close(): void { }

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
        ctx.font = "75px Courier";
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
            ctx.font = "15px Courier";
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

class RThetaDetailsView extends DetailsView {

    private boxX;
    private boxY;
    private boxW;
    private boxH;

    private currentPi = 0;
    private currentConst = 0;
    private overridePi: string | null = null;
    private overrideConst: string | null = null;

    private lastClick = 0;
    private lastKey = "";

    private justEnteredEdit: boolean = false;

    private rComponent;
    private crComponent;

    public constructor(owningComponent: CircuitComponent, x: number, y: number, rComponent: RComponent | null, crComponent: ControlledRComponent | null) {
        super(owningComponent, x, y, 500, 300);


        this.boxH = this.height * 0.8;
        this.boxY = this.height * 0.1;
        this.boxX = this.boxY;
        this.boxW = this.boxH;

        this.rComponent = rComponent;
        this.crComponent = crComponent;

        if(rComponent != null) {
            this.currentPi = rComponent.getPiCoefficient();
            this.currentConst = rComponent.getConstant();
        }
        if(crComponent != null) {
            this.currentPi = crComponent.getPiCoefficient();
            this.currentConst = crComponent.getConstant();
        }
    }

    public override render(view: View): void {
        super.render(view);

        const ctx = view.getDrawingContext();

        ctx.save();

        this.drawCircle(ctx);  
        this.drawTextBoxes(ctx);      

        ctx.restore();
    }

    private drawCircle(ctx: CanvasRenderingContext2D): void {
        const currentAngle = this.currentPi * Math.PI + this.currentConst;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x + this.boxX, this.y + this.boxY, this.boxW, this.boxH);

        ctx.strokeStyle = "#2d85c5";
        ctx.beginPath();
        const r = this.boxW * 0.4;
        ctx.ellipse(this.x + this.boxX + this.boxW / 2, this.y + this.boxY + this.boxH / 2, r, r, 0, 0, Math.PI * 2);

        const cx = this.x + this.boxX + this.boxW / 2;
        const cy = this.y + this.boxY + this.boxH / 2
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(currentAngle) * r, cy - Math.sin(currentAngle) * r);
        ctx.stroke();
        ctx.closePath();

        ctx.strokeStyle = "#61bdee";
        ctx.beginPath();
        ctx.moveTo(this.x + this.boxX + this.boxW * 0.05, this.y + this.boxY + this.boxH / 2);
        ctx.lineTo(this.x + this.boxX + this.boxW * 0.95, this.y + this.boxY + this.boxH / 2);

        ctx.moveTo(this.x + this.boxX + this.boxW / 2, this.y + this.boxY + this.boxH * 0.05);
        ctx.lineTo(this.x + this.boxX + this.boxW / 2, this.y + this.boxY + this.boxH * 0.95);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#2d85c5";
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(currentAngle) * r, cy - Math.sin(currentAngle) * r, r * 0.05, r * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    private drawTextBoxes(ctx: CanvasRenderingContext2D): void {

        ctx.font = "25px Courier";
        const startX = this.x + this.boxX + this.boxW + this.width * 0.1;
        const startY = this.y + this.height * 0.1 + 60;
        const inputWidth = this.width * 0.2;
        const secondLineDist = 60;
        
        ctx.strokeStyle = "#000000";

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + inputWidth, startY);

        ctx.moveTo(startX + ctx.measureText("+").width + 10, startY + secondLineDist);
        ctx.lineTo(startX + inputWidth + ctx.measureText("+").width + 10, startY + secondLineDist);

        ctx.stroke();

        ctx.closePath();

        ctx.fillStyle = "#000000";
        ctx.textBaseline = "bottom";
        ctx.fillText("π", startX + inputWidth + 10, startY - 3);
        ctx.fillText("+", startX, startY + secondLineDist - 3);

        let piText = this.overridePi;
        let constText = this.overrideConst;

        if(piText == null) {
            piText = this.roundForOutput(this.currentPi);
        }
        else {
            ctx.strokeRect(startX - 5, startY - 40, inputWidth + 10, 50);
        }

        if(constText == null) {
            constText = this.roundForOutput(this.currentConst);
        }
        else {
            ctx.strokeRect(startX + ctx.measureText("+").width + 10 - 5, startY - 40 + secondLineDist, inputWidth + 10, 50);
        }

        ctx.fillText(piText, startX + inputWidth / 2 - ctx.measureText(piText).width / 2, startY - 3);
        ctx.fillText(constText, ctx.measureText("+").width + 10 + startX + inputWidth / 2 - ctx.measureText(constText).width / 2, startY - 3 + secondLineDist);

        ctx.strokeStyle = "#000000";
        ctx.strokeRect(startX - 20, this.y + this.boxY, this.width - this.boxX * 2 - this.boxW - 20, 90 + secondLineDist);
        ctx.strokeRect(startX - 20, this.y + this.boxY + 90 + secondLineDist, this.width - this.boxX * 2 - this.boxW - 20, 40);

        ctx.font = "italic 25px Courier";
        ctx.textBaseline = "middle";
        const thetaText = "θ";
        ctx.fillText(thetaText, startX - 20 + (this.width - this.boxX * 2 - this.boxW - 20) / 2 - ctx.measureText(thetaText).width / 2, this.y + this.boxY + 90 + secondLineDist + 20);

    }

    public override mouseClick(x: number, y: number): void {
        const startX = this.x + this.boxX + this.boxW + this.width * 0.1 - 5;
        const startY = this.y + this.height * 0.1 + 20;
        const inputWidth = this.width * 0.2;
        const secondLineDist = 60;

        if(x > startX && x < startX + inputWidth + 30) {
            if(y > startY && y < startY + 50) {
                this.switchFocus(1);
            }
            else if(y > startY + secondLineDist && y < startY + 50 + secondLineDist) {
                this.switchFocus(2);
            }
            else {
                this.switchFocus(0);
            }
        }
        else {
            this.switchFocus(0);
        }
    }

    public override keyDown(keyCode: string): void {
        const currentTime = new Date().getTime();
        const delta = currentTime - this.lastClick;
        if(delta < 100 && keyCode == this.lastKey)
            return;
        this.lastKey = keyCode;
        this.lastClick = currentTime;
        const allowedInputs = "0123456789.";
        if(!allowedInputs.includes(keyCode) && keyCode != "Backspace")
            return;
        if(this.overridePi != null) {
            if(keyCode == "Backspace")
                this.overridePi = this.overridePi.substring(0, Math.max(0, this.overridePi.length - 1));
            else if(this.overridePi == "0" && this.justEnteredEdit)
                this.overridePi = keyCode;
            else
                this.overridePi += keyCode;
        }
        if(this.overrideConst != null) {
            if(keyCode == "Backspace")
                this.overrideConst = this.overrideConst.substring(0, Math.max(0, this.overrideConst.length - 1));
            else if(this.overrideConst == "0" && this.justEnteredEdit)
                this.overrideConst = keyCode;
            else
                this.overrideConst += keyCode;
        }
        this.justEnteredEdit = false;
    }

    private switchFocus(newFocus: number): void {
        if(this.overrideConst != null && this.overrideConst.length > 0)
            this.currentConst = parseFloat(this.overrideConst);
        if(this.overridePi != null && this.overridePi.length > 0)
            this.currentPi = parseFloat(this.overridePi);
        this.overrideConst = null;
        this.overridePi = null;
        if(newFocus == 1)
            this.overridePi = this.roundForOutput(this.currentPi);
        if(newFocus == 2)
            this.overrideConst = this.roundForOutput(this.currentConst);
        if(newFocus > 0)
            this.justEnteredEdit = true;
    }

    private roundForOutput(num: number): string {
        const result = num.toString();
        if(result.length > 6)
            return num.toPrecision(4);
        return result;
    }

    public override close(): void {
        this.switchFocus(0);

        if(this.rComponent != null) {
            this.rComponent.setPiCoefficient(this.currentPi % 2);
            this.rComponent.setConstant(this.currentConst % (2*Math.PI));
        }
        if(this.crComponent != null) {
            this.crComponent.setPiCoefficient(this.currentPi % 2);
            this.crComponent.setConstant(this.currentConst % (2*Math.PI));
        }        
    }
}

class TextDetailsView extends DetailsView {

    private currentText: string = "";
    private textComponent: TextComponent

    private lastClick = 0;
    private lastKey = "";

    public constructor(owningComponent: CircuitComponent, x: number, y: number) {
        super(owningComponent, x, y, 400, 60);
        this.textComponent = owningComponent as TextComponent;

        this.currentText = this.textComponent.getText();
    }

    public override render(view: View): void {
        super.render(view);

        const ctx = view.getDrawingContext();

        ctx.save();

        ctx.font = "35px Courier";
        const startX = this.x + this.width * 0.1;
        const startY = this.y + this.height * 0.9;
        const w = this.width * 0.8;

        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + w, startY);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = "#000000";
        ctx.textBaseline = "bottom";
        const tw = Math.min(w, ctx.measureText(this.currentText).width);
        ctx.fillText(this.currentText, startX + this.width * 0.4 - tw / 2, startY - 4, w);

        ctx.restore();
    }


    public override keyDown(keyCode: string): void {
        const currentTime = new Date().getTime();
        const delta = currentTime - this.lastClick;
        if(delta < 100 && keyCode == this.lastKey)
            return;
        this.lastKey = keyCode;
        this.lastClick = currentTime;

        if(keyCode == "Backspace")
            this.currentText = this.currentText.substring(0, Math.max(0, this.currentText.length - 1));

        if(keyCode.length != 1)
            return;

        this.currentText += keyCode;
    }

    public override close(): void {
        this.textComponent.setText(this.currentText);     
    }
}

class AreaDetailsView extends DetailsView {

    private colourIndex: number = 0;
    private areaComponent: AreaComponent;

    private static colours: string[] = [
        "",
        "#ff000033",
        "#00ff0033",
        "#0000ff33",
        "#ff00ff33",
        "#ffff0033",
        "#00ffff33",
        "#7f000033",
        "#007f0033",
        "#00007f33",
        "#7f007f33",
        "#7f7f0033",
        "#007f7f33",
        "#007f3f33",
        "#00000033",
    ];


    public constructor(owningComponent: CircuitComponent, x: number, y: number) {
        super(owningComponent, x, y, 177, 113);
        this.areaComponent = owningComponent as AreaComponent;

        this.colourIndex = this.areaComponent.getColourId();
    }

    public override render(view: View): void {
        super.render(view);

        const ctx = view.getDrawingContext();

        const bx = 0.1 * this.height + this.x;
        const by = 0.1 * this.height + this.y;
        const bw = this.width - 0.2 * this.height;
        const bh = 0.8 * this.height;
        const squareSize = 30;

        ctx.save();

        for(let i = 0; i < Math.floor(bw / squareSize); i++) {
            for(let j = 0; j < Math.floor(bh / squareSize); j++) {
                const idx = i + j * Math.floor(bw / squareSize);
                if(idx == 0) {
                    ctx.fillStyle = "#ffffffff";
                    ctx.strokeStyle = "#bbbbbb";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(bx + i * squareSize, by + j * squareSize);
                    ctx.lineTo(bx + i * squareSize + squareSize, by + j * squareSize + squareSize);
                    ctx.moveTo(bx + i * squareSize + squareSize, by + j * squareSize);
                    ctx.lineTo(bx + i * squareSize, by + j * squareSize + squareSize);
                    ctx.stroke();
                    ctx.closePath();
                }
                else if(idx < AreaDetailsView.colours.length) {
                    ctx.fillStyle = AreaDetailsView.colours[idx];
                    ctx.fillRect(bx + i * squareSize, by + j * squareSize, squareSize, squareSize);
                }
                else {
                    ctx.fillStyle = "#ffffffff";
                    ctx.fillRect(bx + i * squareSize, by + j * squareSize, squareSize, squareSize);
                }
                
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                ctx.strokeRect(bx + i * squareSize, by + j * squareSize, squareSize, squareSize);
            }
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;
        ctx.strokeRect(bx + (this.colourIndex % Math.floor(bw / squareSize)) * squareSize, by + Math.floor(this.colourIndex / Math.floor(bw / squareSize)) * squareSize, squareSize, squareSize);

        ctx.restore();
    }


    public override close(): void {
        this.areaComponent.setColourId(this.colourIndex);   
    }

    public override mouseClick(x: number, y: number): void {
        const selW = this.width - 0.2 * this.height;
        x -= this.x + 0.1 * this.height;
        y -= this.y + 0.1 * this.height;
        const squareSize = 30;

        x = Math.floor(x / squareSize);
        y = Math.floor(y / squareSize);

        const idx = x + y * Math.floor(selW / squareSize);
        if(idx >= 0 && idx < AreaDetailsView.colours.length)
            this.colourIndex = idx;
    }
}

export { DetailsView }