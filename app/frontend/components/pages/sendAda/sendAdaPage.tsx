import {Fragment, h} from 'preact'
import {connect} from '../../../libs/unistore/preact'
import actions from '../../../actions'

import {getTranslation} from '../../../translations'
import printAda from '../../../helpers/printAda'

import ConfirmTransactionDialog from './confirmTransactionDialog'
import Conversions from '../../common/conversions'
import SearchableSelect from '../../common/searchableSelect'

import AccountDropdown from '../accounts/accountDropdown'
import {getSourceAccountInfo, State} from '../../../state'
import {useCallback, useMemo, useRef} from 'preact/hooks'
import {
  AssetFamily,
  Lovelace,
  SendAmount,
  SendTransactionSummary,
  Token,
  TransactionSummary,
  TxType,
} from '../../../types'
import {AdaIcon, StarIcon} from '../../common/svg'
import {parseCoins} from '../../../../frontend/helpers/validators'
import {assetNameHex2Readable} from '../../../../frontend/wallet/shelley/helpers/addresses'
import tooltip from '../../common/tooltip'

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
  sendTransactionSummary: TransactionSummary & SendTransactionSummary
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
  assetNameHex: string
  type: AssetFamily
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
        {type === AssetFamily.TOKEN ? quantity : printAda(Math.abs(quantity) as Lovelace)}
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

const calculateTotalAmounts = (transactionSummary: TransactionSummary) => {
  const zeroTotal = {totalLovelace: 0 as Lovelace, totalTokens: null}
  if (!transactionSummary || transactionSummary.type !== TxType.SEND_ADA) return zeroTotal
  const {sendAmount, fee, minimalLovelaceAmount} = transactionSummary
  if (sendAmount.assetFamily === AssetFamily.ADA) {
    return {
      totalLovelace: (sendAmount.coins + fee) as Lovelace,
      totalTokens: null,
    }
  }
  if (sendAmount.assetFamily === AssetFamily.TOKEN) {
    return {
      totalLovelace: (minimalLovelaceAmount + fee) as Lovelace,
      totalTokens: sendAmount.token,
    }
  }
  return zeroTotal
}

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
  const amountField = useRef<HTMLInputElement>(null)
  const submitTxBtn = useRef<HTMLButtonElement>(null)
  const sendCardDiv = useRef<HTMLDivElement>(null)

  const sendFormValidationError = sendAddressValidationError || sendAmountValidationError

  const enableSubmit = sendAmount.fieldValue && sendAddress && !sendFormValidationError
  const isSendAddressValid = !sendAddressValidationError && sendAddress !== ''

  const {totalLovelace, totalTokens} = calculateTotalAmounts(summary)

  const adaAsset: DropdownAssetItem = {
    type: AssetFamily.ADA,
    policyId: null,
    assetName: 'ADA',
    assetNameHex: null,
    quantity: balance,
    star: true,
  }
  const dropdownAssetItems: Array<DropdownAssetItem> = useMemo(
    () => [
      adaAsset,
      ...tokenBalance
        .sort((a: Token, b: Token) => b.quantity - a.quantity)
        .map(
          (token: Token): DropdownAssetItem => ({
            ...token,
            assetNameHex: token.assetName,
            assetName: assetNameHex2Readable(token.assetName),
            type: AssetFamily.TOKEN,
            star: false,
          })
        ),
    ],
    [adaAsset, tokenBalance]
  )

  const selectedAsset = useMemo(() => {
    if (sendAmount.assetFamily === AssetFamily.ADA) {
      return adaAsset
    }
    return dropdownAssetItems.find(
      (item) =>
        item.assetNameHex === sendAmount.token.assetName &&
        item.policyId === sendAmount.token.policyId
    )
  }, [adaAsset, dropdownAssetItems, sendAmount])

  const submitHandler = async () => {
    await confirmTransaction('send')
  }

  const searchPredicate = useCallback(
    (query: string, {policyId, assetName}: DropdownAssetItem): boolean =>
      assetName.toLowerCase().includes(query.toLowerCase()) ||
      (policyId && policyId.toLowerCase().includes(query.toLowerCase())),
    []
  )

  const updateSentAssetPair = useCallback(
    (dropdownAssetItem: DropdownAssetItem, fieldValue: string) => {
      if (dropdownAssetItem.type === AssetFamily.ADA) {
        updateAmount({
          assetFamily: AssetFamily.ADA,
          fieldValue,
          coins: parseCoins(fieldValue) || (0 as Lovelace),
        })
      } else if (dropdownAssetItem.type === AssetFamily.TOKEN) {
        updateAmount({
          assetFamily: AssetFamily.TOKEN,
          fieldValue,
          token: {
            policyId: dropdownAssetItem.policyId,
            assetName: dropdownAssetItem.assetNameHex,
            quantity: parseFloat(fieldValue),
          },
        })
      }
    },
    [updateAmount]
  )

  const handleDropdownOnSelect = useCallback(
    (dropdownAssetItem: DropdownAssetItem): void => {
      updateSentAssetPair(dropdownAssetItem, sendAmount.fieldValue)
    },
    [sendAmount.fieldValue, updateSentAssetPair]
  )

  const handleAmountOnInput = useCallback(
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
      onKeyDown={(e) => e.key === 'Enter' && amountField?.current.focus()}
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

  // TODO: is this possible to do in raw CSS?
  // dropdown width is dependand on div that is much higher in HTML DOM
  const calculateDropdownWidth = () => {
    const deriveFrom = sendCardDiv?.current
    if (deriveFrom) {
      const style = window.getComputedStyle(deriveFrom)
      const width = deriveFrom.clientWidth
      const paddingLeft = parseInt(style.paddingLeft, 10)
      const paddingRight = parseInt(style.paddingRight, 10)
      return `${width - paddingLeft - paddingRight}px`
    }
    return '100%'
  }

  const selectAssetDropdown = (
    <Fragment>
      <label className="send-label">Asset</label>
      <SearchableSelect
        wrapperClassName="no-margin"
        defaultItem={selectedAsset}
        displaySelectedItem={({assetName}: DropdownAssetItem) => assetName}
        displaySelectedItemClassName="input dropdown"
        items={dropdownAssetItems}
        displayItem={showDropdownAssetItem}
        onSelect={handleDropdownOnSelect}
        showSearch={dropdownAssetItems.length >= 4}
        searchPredicate={searchPredicate}
        searchPlaceholder={`Search from ${dropdownAssetItems.length} assets by name or hash`}
        dropdownClassName="modal-dropdown"
        getDropdownWidth={calculateDropdownWidth}
      />
    </Fragment>
  )

  const amountInput = (
    <Fragment>
      <label
        className={`ada-label amount ${selectedAsset.type === AssetFamily.TOKEN ? 'token' : ''}`}
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
          onInput={handleAmountOnInput}
          autoComplete="off"
          ref={amountField}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && submitTxBtn) {
              // eslint-disable-next-line no-unused-expressions
              submitTxBtn?.current.click()
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
    <div className="send card" ref={sendCardDiv}>
      <h2 className={`card-title ${isModal ? 'show' : ''}`}>{title}</h2>
      {isModal ? accountSwitch : addressInput}
      <div className="send-values">
        {selectAssetDropdown}
        {amountInput}
        <div className="ada-label">Fee</div>
        <div className="send-fee">{printAda(transactionFee)}</div>
        {selectedAsset.type === AssetFamily.TOKEN && (
          <Fragment>
            <div className="send-label">
              Min ADA
              <a
                {...tooltip(
                  'Every output created by a transaction must include a minimum amount of ada, which is calculated based on the size of the output.',
                  true
                )}
              >
                <span className="show-info">{''}</span>
              </a>
            </div>
            {/* TODO: Connect to state when this values is calculated */}
            <div className="send-fee">{printAda(2000000 as Lovelace)}</div>
          </Fragment>
        )}
      </div>
      <div className="send-total">
        <div className="send-total-title">Total</div>
        <div className="send-total-inner">
          {selectedAsset.type === AssetFamily.ADA ? (
            <div className="send-total-ada">
              {printAda(totalLovelace)}
              <AdaIcon />
            </div>
          ) : (
            <div className="send-total-ada">
              {totalTokens?.quantity != null ? totalTokens.quantity : 0}{' '}
              {totalTokens ? assetNameHex2Readable(totalTokens.assetName) : selectedAsset.assetName}
            </div>
          )}
          {selectedAsset.type === AssetFamily.ADA
            ? conversionRates && (
              <Conversions balance={totalLovelace} conversionRates={conversionRates} />
            )
            : ''}
        </div>
        <div />
        {selectedAsset.type === AssetFamily.TOKEN && (
          <div className="send-total-inner ma-ada-fees">
            <div>
              +{printAda(totalLovelace)}
              <AdaIcon />
            </div>
            {conversionRates && (
              <Conversions balance={totalLovelace} conversionRates={conversionRates} />
            )}
          </div>
        )}
      </div>
      <div className="validation-row">
        <button
          className="button primary medium"
          disabled={!enableSubmit || feeRecalculating}
          onClick={submitHandler}
          ref={submitTxBtn}
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
