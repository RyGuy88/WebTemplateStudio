import * as React from "react";
import { connect } from "react-redux";

import asModal from "../../../components/Modal";

import { injectIntl, InjectedIntlProps } from "react-intl";
import { closeModalAction } from "../../../store/modals/action";
import { AppState } from "../../../store/combineReducers";
import RootAction from "../../../store/ActionType";
import { isAzureLoginModalOpenSelector } from "../../../store/modals/selector";
import buttonStyles from "../../../css/buttonStyles.module.css";
import styles from "./styles.module.css";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import keyUpHandler from "../../../utils/keyUpHandler";
import messages from "./messages";
import { KEY_EVENTS } from "../../../utils/constants";
import { ReactComponent as Cancel } from "../../../assets/cancel.svg";
import CollapsibleInfoBox from "../../../components/CollapsibleInfoBox";
import { WIZARD_CONTENT_INTERNAL_NAMES } from "../../../utils/constants";
import * as ModalActions from "../../../store/modals/action";
import { ThunkDispatch } from "redux-thunk";
import { azureLogin } from "../../../utils/extensionService/extensionService";
import { logIntoAzureActionAction } from "../../../store/azureProfileData/login/action";
import { IVSCodeObject } from "../../../types/vscode";
import { AppContext } from "../../../AppContext";

interface IStateProps {
  isModalOpen: boolean;
  isLoggedIn: boolean;
  selectedAzureServiceName: string;
}

interface IDispatchProps {
  closeModal: () => any;
  openAppServiceModal: () => any;
  openCosmosDbModal: () => any;
  logIntoAzure: (loginData: AzureProfile) => void;
}

type Props = IStateProps & IDispatchProps & InjectedIntlProps;

const AzureLoginModal = (props: Props) => {
  const { formatMessage } = props.intl;
  const {
    isLoggedIn,
    closeModal,
    selectedAzureServiceName,
    openAppServiceModal,
    openCosmosDbModal,
    logIntoAzure
  } = props;
  const { vscode } = React.useContext(AppContext);

  const handleSignInClick = () => {
    azureLogin(vscode).then((event)=>{
      const message = event.data;
      if (message.payload !== null) {
        const loginData = message.payload as AzureProfile;
        logIntoAzure(loginData);
      }
    })
  };

  const cancelKeyDownHandler = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.key === KEY_EVENTS.ENTER || event.key === KEY_EVENTS.SPACE) {
      event.preventDefault();
      event.stopPropagation();
      closeModal();
    }
  };

  React.useEffect(() => {
    // close sign in modal and opens azure service form
    if (isLoggedIn) {
      closeModal();
      if (
        selectedAzureServiceName &&
        selectedAzureServiceName === WIZARD_CONTENT_INTERNAL_NAMES.APP_SERVICE
      ) {
        openAppServiceModal();
      } else if (
        selectedAzureServiceName &&
        selectedAzureServiceName === WIZARD_CONTENT_INTERNAL_NAMES.APP_SERVICE
      ) {
        openCosmosDbModal();
      }
    }
  }, [isLoggedIn]);

  return (
    <div>
      <div className={styles.headerContainer}>
        <div className={styles.title}>
          {formatMessage(messages.getStartedWithAzure)}
        </div>
        <Cancel
          tabIndex={0}
          className={styles.cancelIcon}
          onClick={props.closeModal}
          onKeyDown={cancelKeyDownHandler}
        />
      </div>

      <div className={styles.questionaryContainer}>
        <CollapsibleInfoBox
          question={formatMessage(messages.freeAccountQuestion)}
          answer={formatMessage(messages.freeAccountAnswer)}
          initialAnswerShownState={true}
        />
        <CollapsibleInfoBox
          question={formatMessage(messages.paymentQuestion)}
          answer={formatMessage(messages.paymentAnswer)}
        />
        <CollapsibleInfoBox
          question={formatMessage(messages.freeTrialQuestion)}
          answer={formatMessage(messages.freeTrialAnswer)}
        />
        <CollapsibleInfoBox
          question={formatMessage(messages.freeTrialUpgradeQuestion)}
          answer={formatMessage(messages.freeTrialUpgradeAnswer)}
        />
        <div className={styles.paragraph}>
          <a
            className={styles.link}
            href="https://azure.microsoft.com/en-us/free/free-account-faq/"
            onKeyUp={keyUpHandler}
          >
            <FormattedMessage
              id="azureLoginModal.azureReadMore"
              defaultMessage="Learn more about the Azure free account. Read the FAQ >"
            />
          </a>
        </div>
      </div>
      <div className={styles.footerContainer}>
        <button
          onClick={handleSignInClick}
          className={classnames(buttonStyles.buttonDark, styles.button)}
        >
          <FormattedMessage
            id="azureLoginModal.signIn"
            defaultMessage="Sign In"
          />
        </button>
        <div className={styles.buttonContainer}>
          <button
            className={classnames(
              styles.button,
              styles.buttonNext,
              buttonStyles.buttonHighlighted
            )}
          >
            <a
              className={styles.linkToButton}
              href="https://azure.microsoft.com/free/"
              onKeyUp={keyUpHandler}
            >
              <FormattedMessage
                id="azureLoginModal.createAccount"
                defaultMessage="Create Free Account"
              />
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: AppState): IStateProps => {
  const { isLoggedIn } = state.azureProfileData;
  return {
    isModalOpen: isAzureLoginModalOpenSelector(state),
    isLoggedIn,
    selectedAzureServiceName: state.modals.openModal.modalData
  };
};
const mapDispatchToProps = (
  dispatch: ThunkDispatch<AppState, void, RootAction>
): IDispatchProps => ({
  closeModal: () => {
    dispatch(closeModalAction());
  },
  openCosmosDbModal: () => {
    dispatch(ModalActions.openCosmosDbModalAction());
  },
  openAppServiceModal: () => {
    dispatch(ModalActions.openAppServiceModalAction());
  },
  logIntoAzure: (loginData: AzureProfile) => {
    dispatch(logIntoAzureActionAction(loginData));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(asModal(injectIntl(AzureLoginModal)));
