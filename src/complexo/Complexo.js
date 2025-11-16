class Complexo { // classe dos números complexos
    constructor(real = 0, imag = 0) { // instância é inicializada com valor referente às partes real e imaginária
        this.real = Number(real);
        this.imag = Number(imag);
    }

    toString() { // transforma os números em strings para melhor visualização na saída, sem alterar o valor em si, apenas a visualização final
        if (this.imag === 0) return String(this.real); // se a parte imaginária for = 0, retornar apenas a parte real
        if (this.real === 0) { // se a parte real for 0, retornar apenas a parte imaginária
            if (this.imag === 1) return 'i'; // se a parte imaginária for 1, retornar apenas "i" (ao invés de "1i")
            if (this.imag === -1) return '-i'; // se a parte imaginária for -1, retornar apenas "-i" (ao invés de "-1i")
            return `${this.imag}i`; // caso nenhuma das situações acima se aplique, escrever o número normalmente
        }
        const sinal = this.imag >= 0 ? '+' : '-'; // aplica o sinal adequado ao número imaginário (se maior/igual a 0, então +, caso contrário -)
        const absImag = Math.abs(this.imag); // guarda a versão absoluta (sem sinal) do valor para evitar erros de visualização quando for imprimir (evitar sinais duplicados como em "1 - -3i")
        const imagFormat = (absImag === 1) ? 'i' : `${absImag}i`; // formata visualzação de forma a omitir o '1' quando apropriado
        return `${this.real} ${sinal} ${imagFormat}`; // retorna os valores dentro de uma string para melhor visualização
    }

    add(outro) { // função soma
        const somaReal = this.real + outro.real; // soma parte real
        const somaImag = this.imag + outro.imag; // soma parte imaginária
        return new Complexo(somaReal, somaImag) // une parte real e imaginária
    }

    sub(outro) { // função subtração
        const realResult = this.real - outro.real; // subtrai parte real
        const imagResult = this.imag - outro.imag; // subtrai parte imaginária
        return new Complexo(realResult, imagResult); // une parte real e imaginária
    }
    
    mul(outro) { // função multiplicação
        const realResult = this.real * outro.real - this.imag * outro.imag; // multiplica parte real
        const imagResult = this.real * outro.imag + this.imag * outro.real; // multiplica parte imaginária
        return new Complexo(realResult, imagResult); // une parte real e imaginária
    }

    div(outro) { // função divisão, cada const (a,b,c,d) representa um elemento da formula
        const a = this.real;
        const b = this.imag;
        const c = outro.real;
        const d = outro.imag;
        const denominador = c*c+d*d;
        if (denominador === 0) {
            throw new Error('Divisão por zero');
        } // da erro no caso de denominador zero
        const realResult = (a*c+b*d) / denominador; // divide parte real
        const imagResult = (b*c-a*d) / denominador; // divide parte imaginaria
        return new Complexo(realResult, imagResult); // une parte real e imaginária
    }
}

module.exports = { Complexo };
