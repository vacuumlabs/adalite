import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

import {getTranslation} from '../../../translations'
import printAda from '../../../helpers/printAda'

import ConfirmTransactionDialog from './confirmTransactionDialog'
import Conversions from '../../common/conversions'
import SearchableSelect from '../../common/searchableSelect'

import AccountDropdown from '../accounts/accountDropdown'
import {getSourceAccountInfo, SendTransactionSummary, State} from '../../../state'
import {useCallback, useState} from 'preact/hooks'
import {AssetType, Lovelace, SendAmount, Token} from '../../../types'
import {StarIcon} from '../../common/svg'
import {parseCoins} from '../../../../frontend/helpers/validators'
import {assetNameHex2Readable} from '../../../../frontend/wallet/shelley/helpers/addresses'

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
  sendAmount: SendAmount
  sendAmountValidationError: any
  updateAddress: any
  updateAmount: (sendAmount: SendAmount) => void
  confirmTransaction: any
  shouldShowConfirmTransactionDialog: any
  feeRecalculating: any
  sendMaxFunds: any
  conversionRates: any
  sendTransactionSummary: SendTransactionSummary
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
        {type === AssetType.TOKEN ? assetNameHex2Readable(assetName) : assetName}
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
}: Props) => {
  let amountField: HTMLInputElement
  let submitTxBtn: HTMLButtonElement

  const sendFormValidationError = sendAddressValidationError || sendAmountValidationError

  const enableSubmit = sendAmount.fieldValue && sendAddress && !sendFormValidationError
  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''
  const total =
    (summary.amount?.assetType === AssetType.ADA
      ? summary.amount.coins
      : summary.minimalLovelaceAmount) + transactionFee
  const adaAsset: DropdownAssetItem = {
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

  const [selectedAsset, setSelectedAsset] = useState(adaAsset)

  const submitHandler = async () => {
    await confirmTransaction('send')
  }

  const getDefaultItem = () => adaAsset

  const searchPredicate = useCallback(
    (query: string, {policyId, assetName}: DropdownAssetItem): boolean =>
      assetName.toLowerCase().includes(query.toLowerCase()) ||
      (policyId && policyId.toLowerCase().includes(query.toLowerCase())),
    []
  )

  const updateSentAssetPair = useCallback(
    (dropdownAssetItem: DropdownAssetItem, fieldValue: string) => {
      if (dropdownAssetItem.type === AssetType.ADA) {
        updateAmount({
          assetType: AssetType.ADA,
          fieldValue,
          coins: parseCoins(fieldValue) || (0 as Lovelace),
        })
      } else if (dropdownAssetItem.type === AssetType.TOKEN) {
        updateAmount({
          assetType: AssetType.TOKEN,
          fieldValue,
          token: {
            policyId: dropdownAssetItem.policyId,
            assetName: dropdownAssetItem.assetName,
            quantity: parseFloat(fieldValue),
          },
        })
      }
    },
    [updateAmount]
  )

  const onSelect = useCallback(
    (dropdownAssetItem: DropdownAssetItem): void => {
      setSelectedAsset(dropdownAssetItem)
      updateSentAssetPair(dropdownAssetItem, sendAmount.fieldValue)
    },
    [sendAmount.fieldValue, updateSentAssetPair]
  )

  const onInput = useCallback(
    (e) => {
      updateSentAssetPair(selectedAsset, e?.target?.value)
    },
    [selectedAsset, updateSentAssetPair]
  )

  const addressInput = (
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
  )

  const accountSwitch = (
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
  )

  const selectAssetDropdown = (
    <SearchableSelect
      label="Select asset"
      defaultItem={getDefaultItem()}
      displaySelectedItem={({type, assetName}: DropdownAssetItem) =>
        `${type === AssetType.TOKEN ? assetNameHex2Readable(assetName) : assetName}`
      }
      displaySelectedItemClassName="input dropdown"
      items={dropdownAssetItems}
      displayItem={showDropdownAssetItem}
      onSelect={onSelect}
      showSearch={dropdownAssetItems.length >= 6}
      searchPredicate={searchPredicate}
      searchPlaceholder={`Search from ${dropdownAssetItems.length} assets by name or hash`}
    />
  )

  const selectAssetDropdownModal = (
    <Fragment>
      <label className="asset-dropdown-label">Asset</label>
      <SearchableSelect
        wrapperClassName="no-margin"
        defaultItem={getDefaultItem()}
        displaySelectedItem={({type, assetName}: DropdownAssetItem) =>
          `${type === AssetType.TOKEN ? assetNameHex2Readable(assetName) : assetName}`
        }
        displaySelectedItemClassName="input dropdown"
        items={dropdownAssetItems}
        displayItem={showDropdownAssetItem}
        onSelect={onSelect}
        showSearch={dropdownAssetItems.length >= 6}
        searchPredicate={searchPredicate}
        searchPlaceholder={`Search from ${dropdownAssetItems.length} assets by name or hash`}
        dropdownClassName="modal-dropdown"
        // TODO: replace this with something reasonable
        dropdownStyle={(() => {
          const modal = document.getElementsByClassName('modal-body')[0] as any
          const width = modal?.clientWidth
          const paddingLeft = modal && window.getComputedStyle(modal).paddingLeft
          const paddingRight = modal && window.getComputedStyle(modal).paddingLeft
          return `width: calc(${width} - ${paddingLeft} - ${paddingRight});`
        })()}
      />
    </Fragment>
  )

  const amountInput = (
    <Fragment>
      <label
        className={`ada-label amount ${selectedAsset.type === AssetType.TOKEN ? 'token' : ''}`}
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
          value={sendAmount.fieldValue}
          onInput={onInput}
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
    </Fragment>
  )

  return (
    <div className="send card">
      <h2 className={`card-title ${isModal ? 'show' : ''}`}>{title}</h2>
      {isModal ? accountSwitch : addressInput}
      {!isModal && selectAssetDropdown}
      <div className="send-values">
        {isModal && selectAssetDropdownModal}
        {amountInput}
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
          className="button primary medium"
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
    sendAmount: state.sendAmount,
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
  }),
  actions
)(SendAdaPage)
