class Complexo { // classe dos números complexos
    constructor(real = 0, imag = 0) {
        this.real = Number(real);
        this.imag = Number(imag);
    }

    toString() { // visualização limpa em string
        if (this.imag === 0) return String(this.real);
        if (this.real === 0) {
            if (this.imag === 1) return 'i';
            if (this.imag === -1) return '-i';
            return `${this.imag}i`;
        }
        const sinal = this.imag >= 0 ? '+' : '-';
        const absImag = Math.abs(this.imag);
        const imagFormat = (absImag === 1) ? 'i' : `${absImag}i`;
        return `${this.real} ${sinal} ${imagFormat}`;
    }

    add(outro) { // função soma | Z1 + Z2 = (a + c) + (b + d)i | somam-se partes reais e imaginárias separadamente
        const realResult = this.real + outro.real;
        const imagResult = this.imag + outro.imag;
        return new Complexo(realResult, imagResult)
    }

    sub(outro) { // função subtração | Z1 - Z2 = (a - c) + (b - d)i | subtraem-se as partes reais e imaginárias separadamente
        const realResult = this.real - outro.real;
        const imagResult = this.imag - outro.imag;
        return new Complexo(realResult, imagResult);
    }
    
    mul(outro) { // função multiplicação | Z1 * Z2 = (ac - bd) + (ad + bc)i | multiplicação distributiva (lembrando que i² = -1)
        const realResult = this.real * outro.real - this.imag * outro.imag;
        const imagResult = this.real * outro.imag + this.imag * outro.real;
        return new Complexo(realResult, imagResult);
    }

    div(outro) { // função divisão | Z1 / Z2 = [(ac + bd) + (bc - ad)i] / (c² + d²) | multiplicam-se numerador e denominador pelo conjugado do denominador | cada const (a,b,c,d) representa um elemento da formula
        const a = this.real;
        const b = this.imag;
        const c = outro.real;
        const d = outro.imag;
        const denominador = c*c+d*d;
        if (denominador === 0) {
            throw new Error('Divisão por zero');
        }
        const realResult = (a*c+b*d) / denominador;
        const imagResult = (b*c-a*d) / denominador;
        return new Complexo(realResult, imagResult);
    }

    conjugado() { // função conjugado | para 'Z = a + bi' seu conjudago é 'Z̄ = a - bi' | inverte-se o sinal da parte imaginária
        return new Complexo(this.real, -this.imag);
    }

    abs() { // função módulo | |Z| = √(a² + b²) | aplica-se o Teorema de Pitágoras
        return Math.hypot(this.real, this.imag);
    }

    arg() { // função argumento | θ = atan2(b, a) (em radianos) | ângulo 'θ' do número complexo no plano | calcula-se utilizando `atan2` para garantir o quadrante correto
        return Math.atan2(this.imag, this.real);
    }

    pow(n) { // função potenciação | Zⁿ = |Z|ⁿ * (cos(nθ) + i * sin(nθ)) | aplica-se a Fórmula de Moivre na forma polar
        if (typeof n !== 'number') {
            throw new Error('O expoente de ser um número')
        }
        const r = this.abs();
        const theta = this.arg();
        const novoAbs = Math.pow(r, n);
        const novoArg = n * theta;
        const realResult = novoAbs * Math.cos(novoArg);
        const imagResult = novoAbs * Math.sin(novoArg);
        return new Complexo(realResult, imagResult);
    }

    sqrt() { // função raiz quadrada principal | √Z = √|Z| * (cos(θ/2) + i * sin(θ/2)) | a raíz quadrada principal é a potência com n = 1/2
        const r = this.abs();
        const theta = this.arg();
        const novoAbs = Math.sqrt(r);
        const novoArg = theta / 2;
        const realResult = novoAbs * Math.cos(novoArg);
        const imagResult = novoAbs * Math.sin(novoArg);
        return new Complexo(realResult, imagResult);
    }

    equals(outro, eps = 1e-9) { // funções tolerância de igualidade
        if (!(outro instanceof Complexo)) {
            return false;
        }
        const realIguais = Math.abs(this.real - outro.real) <= eps;
        const imagIguais = Math.abs(this.imag - outro.imag) <= eps;
        return realIguais && imagIguais;
    }
}

module.exports = { Complexo };
