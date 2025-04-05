export class UpdateCountryDto{
// ?: -> Indica que a propriedade não é obrigadtória
// O que, em uma atualização, faz sentido pelo fato do usuário decidir alterar apenas um dos campos 
    name ?: string;
    flagUrl?: string;
}