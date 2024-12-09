# Mi Nuevo Token ERC20 con Faucet y Staking

Este proyecto incluye la implementación de un token ERC20 con 6 decimales, un contrato de faucet para distribuir tokens y un contrato de staking que permite a los usuarios ganar recompensas al bloquear sus tokens.

## Descripción

El proyecto consta de:

1. **MyToken**: Un contrato ERC20 con 6 decimales y funcionalidad de minteo, donde solo el propietario puede mintear tokens.
2. **Faucet**: Permite a los usuarios reclamar una cantidad fija de tokens una sola vez.
3. **Staking**: Los usuarios pueden bloquear tokens para ganar recompensas calculadas en función del tiempo que han estado bloqueados.

---

## Características

- **Token ERC20**: Implementa un token con 6 decimales (MTK).
- **Faucet**:
  - Los usuarios pueden reclamar 200 MTK una sola vez.
  - Se utiliza un sistema de eventos para seguimiento.
- **Staking**:
  - Los usuarios pueden bloquear sus tokens y ganar recompensas.
  - Las recompensas se calculan a razón del `0.1%` por minuto para pruebas.

---

## Estructura del Proyecto
