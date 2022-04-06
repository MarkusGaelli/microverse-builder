class SpinActor {
    setup() {
        this.scriptListen("startSpinning", "startSpinning");
        this.scriptListen("stopSpinning", "stopSpinning");
    }
    
    startSpinning(spin) {
        this.isSpinning = true;
        this.qSpin = Worldcore.q_euler(0, spin, 0);
        this.doSpin();
    }

    doSpin() {
        if(this.isSpinning) {
            this.setRotation(Worldcore.q_multiply(this._rotation, this.qSpin));
            this.future(50).doSpin();
        }
    }

    stopSpinning() {
        this.isSpinning = false;
    }

    destroy() {
        delete this.isSpinning;
        this.unsubscribe(this.id, "startSpinning");
        this.unsubscribe(this.id, "stopSpinning");
    }
}

class SpinPawn {
    setup() {
        this.addEventListener("pointerDown", "onPointerDown");
        this.addEventListener("pointerUp", "onPointerUp");
        this.addEventListener("pointerMove", "onPointerMove");
    }

    theta(xyz) {
        let local = this.world2local(xyz);
        return Math.atan2(local[0], local[2]);
    }

    onPointerDown(p3d) {
        console.log("down");
        this.base = this.theta(p3d.xyz);
        this.deltaAngle = 0;
        this.say("stopSpinning");
    }

    onPointerMove(p3d) {
        let next = this.theta(p3d.xyz);
        this.deltaAngle = (next - this.base) / 2;
        let qAngle = Worldcore.q_euler(0, this.deltaAngle, 0);
        this.setRotation(Worldcore.q_multiply(this._rotation, qAngle));
    }

    onPointerUp(p3d) {
        if(p3d.xyz){ // clean up and see if we can spin
            this.onPointerMove(p3d);
            if(Math.abs(this.deltaAngle) > 0.001) {
                let a = this.deltaAngle;
                a = Math.min(Math.max(-0.1, a), 0.1);
                this.say("startSpinning", a);
            }
        }
    }

    destroy() {
        this.removeEventListener("pointerDown", "onPointerDown");
        this.removeEventListener("pointerUp", "onPointerUp");
        this.removeEventListener("pointerMove", "onPointerMove");
    }
}

export default {
    modules: [
        {
            name: "Spin",
            actorBehaviors: [SpinActor],
            pawnBehaviors: [SpinPawn]
        }
    ]
}

/* globals Worldcore */
