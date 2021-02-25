import {h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

import {getTranslation} from '../../../translations'
import printAda from '../../../helpers/printAda'

import ConfirmTransactionDialog from './confirmTransactionDialog'
import Conversions from '../../common/conversions'
import SearchableSelect from '../../common/searchableSelect'

import AccountDropdown from '../accounts/accountDropdown'
import {getSourceAccountInfo, State} from '../../../state'
import {useCallback} from 'preact/hooks'
import {AssetType, Lovelace, Token} from '../../../types'
import {StarIcon} from '../../common/svg'
import {AssetDataProvider} from '../../../../frontend/helpers/dataProviders/types'

const CalculatingFee = () => <div className="validation-message send">Calculating fee...</div>

const SendFormErrorMessage = ({sendFormValidationError}) => (
  <span>{getTranslation(sendFormValidationError.code, sendFormValidationError.params)}</span>
)

const SendValidation = ({sendFormValidationError, txSuccessTab}) =>
  txSuccessTab === 'send' && !sendFormValidationError ? (
    <div className="validation-message transaction-success">Transaction successful!</div>
  ) : (
    sendFormValidationError && (
      <div className="validation-message send error">
        <SendFormErrorMessage sendFormValidationError={sendFormValidationError} />
      </div>
    )
  )

interface Props {
  sendResponse: any
  sendAddress: string
  sendAddressValidationError: any
  sendAmount: any
  sendAmountValidationError: any
  updateAddress: any
  updateAmount: any
  confirmTransaction: any
  shouldShowConfirmTransactionDialog: any
  feeRecalculating: any
  sendMaxFunds: any
  conversionRates: any
  sendTransactionSummary: any
  transactionFee: any
  txSuccessTab: any
  balance: any
  isModal: boolean
  title: string
  sourceAccountIndex: number
  targetAccountIndex: number
  setSourceAccount: any
  setTargetAccount: any
  switchSourceAndTargetAccounts: any
  tokenBalance: Array<Token>
  sendAsset: AssetDataProvider
  updateSendAsset: (assetType: AssetType, underlyingToken?: Token) => void
}

type DropdownAssetItem = Token & {
  type: AssetType
  star?: boolean
}

const showDropdownAssetItem = ({type, star, assetName, policyId, quantity}: DropdownAssetItem) => (
  <div className="multi-asset-item">
    <div className="multi-asset-name-amount">
      <div className="multi-asset-name">
        {star && <StarIcon />}
        {assetName}
      </div>
      <div className="multi-asset-amount">
        {type === AssetType.TOKEN ? quantity : printAda(Math.abs(quantity) as Lovelace)}
      </div>
    </div>
    {policyId && (
      <div className="multi-asset-hash">
        <span className="ellipsis">{policyId.slice(0, -6)}</span>
        <span>{policyId.slice(-6)}</span>
      </div>
    )}
  </div>
)

const SendAdaPage = ({
  sendResponse,
  sendAddress,
  sendAddressValidationError,
  sendAmount,
  sendAmountValidationError,
  updateAddress,
  updateAmount,
  confirmTransaction,
  shouldShowConfirmTransactionDialog,
  feeRecalculating,
  sendMaxFunds,
  conversionRates,
  sendTransactionSummary: summary,
  transactionFee,
  txSuccessTab,
  balance,
  isModal, // TODO: remove
  title,
  sourceAccountIndex,
  targetAccountIndex,
  setSourceAccount,
  setTargetAccount,
  switchSourceAndTargetAccounts,
  tokenBalance,
  sendAsset,
  updateSendAsset,
}: Props) => {
  let amountField: HTMLInputElement
  let submitTxBtn: HTMLButtonElement

  const sendFormValidationError = sendAddressValidationError || sendAmountValidationError

  const enableSubmit = sendAmount && sendAddress && !sendFormValidationError
  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''
  const total = summary.amount + transactionFee
  const adaAsset = {
    type: AssetType.ADA,
    policyId: null,
    assetName: 'ADA',
    quantity: balance,
    star: true,
  }
  const dropdownAssetItems: Array<DropdownAssetItem> = [
    adaAsset,
    ...tokenBalance
      .sort((a: Token, b: Token) => b.quantity - a.quantity)
      .map(
        (token: Token): DropdownAssetItem => ({
          ...token,
          type: AssetType.TOKEN,
          star: false,
        })
      ),
  ]

  const submitHandler = async () => {
    await confirmTransaction('send')
  }

  const getDefaultItem = () => {
    if (sendAsset.isADA) {
      return adaAsset
    }
    const defaultItem = dropdownAssetItems.find(
      (selectAsset: DropdownAssetItem) => selectAsset.policyId === sendAsset.getTokenPolicyId()
    )
    if (defaultItem) return defaultItem
    updateSendAsset(AssetType.ADA)
    return adaAsset
  }

  const searchPredicate = useCallback(
    (query: string, {policyId, assetName}: DropdownAssetItem): boolean =>
      assetName.toLowerCase().includes(query.toLowerCase()) ||
      (policyId && policyId.toLowerCase().includes(query.toLowerCase())),
    []
  )

  const onSelect = (dropdownAssetItem: DropdownAssetItem): void => {
    if (dropdownAssetItem.type === AssetType.ADA) {
      updateSendAsset(AssetType.ADA)
    } else if (dropdownAssetItem.type === AssetType.TOKEN) {
      updateSendAsset(AssetType.TOKEN, dropdownAssetItem)
    }
  }

  return (
    <div className="send card">
      <h2 className={`card-title ${isModal ? 'show' : ''}`}>{title}</h2>
      {!isModal && (
        <input
          type="text"
          id="send-address"
          className={`input ${isModal ? '' : 'send-address'} fullwidth`}
          name="send-address"
          placeholder="Receiving address"
          value={sendAddress}
          onInput={updateAddress}
          autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && amountField.focus()}
          disabled={isModal}
        />
      )}
      {isModal && (
        <div className="send-values dropdowns">
          <label className="account-label">From</label>
          <AccountDropdown accountIndex={sourceAccountIndex} setAccountFunc={setSourceAccount} />
          <button className="button account-switch" onClick={switchSourceAndTargetAccounts}>
            Switch
          </button>
          <div />
          <label className="account-label">To</label>
          <AccountDropdown accountIndex={targetAccountIndex} setAccountFunc={setTargetAccount} />
        </div>
      )}
      <SearchableSelect
        label="Select asset"
        defaultItem={getDefaultItem()}
        displaySelectedItem={(tokenBalanceWithAda: DropdownAssetItem) =>
          `${tokenBalanceWithAda.assetName}`
        }
        displaySelectedItemClassName="input"
        items={dropdownAssetItems}
        displayItem={showDropdownAssetItem}
        onSelect={onSelect}
        showSearch={dropdownAssetItems.length >= 6}
        searchPredicate={searchPredicate}
        searchPlaceholder={`Search from ${dropdownAssetItems.length} assets by name or hash`}
      />
      <div className="send-values">
        <label
          className={`ada-label amount ${sendAsset.isToken ? 'token' : ''}`}
          htmlFor={`${isModal ? 'account' : ''}send-amount`}
        >
          Amount
        </label>
        <div className="input-wrapper">
          <input
            className="input send-amount"
            id={`${isModal ? 'account' : ''}send-amount`}
            name={`${isModal ? 'account' : ''}send-amount`}
            placeholder="0.000000"
            value={sendAmount}
            onInput={updateAmount}
            autoComplete="off"
            ref={(element) => {
              amountField = element
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && submitTxBtn) {
                submitTxBtn.click()
                e.preventDefault()
              }
            }}
          />
          <button
            className="button send-max"
            onClick={sendMaxFunds}
            disabled={!isSendAddressValid || !balance}
          >
            Max
          </button>
        </div>
        <div className="ada-label">Fee</div>
        <div className="send-fee">{printAda(transactionFee)}</div>
      </div>
      <div className="send-total">
        <div className="send-total-title">Total</div>
        <div className="send-total-inner">
          <div className="send-total-ada">{printAda(total)}</div>
          {conversionRates && <Conversions balance={total} conversionRates={conversionRates} />}
        </div>
      </div>
      <div className="validation-row">
        <button
          className="button primary"
          disabled={!enableSubmit || feeRecalculating}
          onClick={submitHandler}
          ref={(element) => {
            submitTxBtn = element
          }}
        >
          Send
        </button>
        {feeRecalculating ? (
          <CalculatingFee />
        ) : (
          <SendValidation
            sendFormValidationError={sendFormValidationError}
            txSuccessTab={txSuccessTab}
          />
        )}
      </div>
      {shouldShowConfirmTransactionDialog && !isModal && <ConfirmTransactionDialog />}
    </div>
  )
}

SendAdaPage.defaultProps = {
  isModal: false,
  title: 'Send',
}

export default connect(
  (state: State) => ({
    sendResponse: state.sendResponse,
    sendAddressValidationError: state.sendAddressValidationError,
    sendAddress: state.sendAddress.fieldValue,
    sendAmountValidationError: state.sendAmountValidationError,
    sendAmount: state.sendAmount.fieldValue,
    shouldShowConfirmTransactionDialog: state.shouldShowConfirmTransactionDialog,
    feeRecalculating: state.calculatingFee,
    conversionRates: state.conversionRates && state.conversionRates.data,
    sendTransactionSummary: state.sendTransactionSummary,
    transactionFee: state.transactionFee,
    txSuccessTab: state.txSuccessTab,
    balance: getSourceAccountInfo(state).balance,
    sourceAccountIndex: state.sourceAccountIndex,
    targetAccountIndex: state.targetAccountIndex,
    tokenBalance: getSourceAccountInfo(state).tokenBalance,
    sendAsset: state.sendAsset,
  }),
  actions
)(SendAdaPage)
