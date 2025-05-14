import CreateChannel from "./components/create-channel";
import NewDM from "./components/new-dm";
import ProfileInfo from "./components/profile-info";
import ContactList from "@/components/contact-list";
import GroupChannelList from "@/components/group-channel-list";

function ContactsContainer() {
  return (
    <div className="relative md:w-[35vw] lg:w-[25vw] xl:w-[20vw] w-full bg-[#121219] border-r border-[#2c2c36] shadow-[0_0_20px_#9333ea22]">
      <div className="pt-4">
        <Logo />
      </div>

      <div className="my-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <Title text="Direct Messages" />
          <NewDM />
        </div>
        <div className="max-h-[38vh] overflow-y-auto no-scrollbar">
          <ContactList />
        </div>
      </div>

      <div className="my-6 px-4">
        <div className="flex items-center justify-between mb-2">
          <Title text="Groups" />
          <CreateChannel />
        </div>
        <div className="max-h-[38vh] overflow-y-auto no-scrollbar">
          <GroupChannelList />
        </div>
      </div>

      <ProfileInfo />
    </div>
  );
}

export default ContactsContainer;

const Logo = () => {
  return (
    <div className="flex p-5 justify-start items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9333ea] to-[#6b21a8] shadow-[0_0_15px_#9333ea88] flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h4m1 8a9 9 0 110-18 9 9 0 010 18z"
          />
        </svg>
      </div>
      <span className="text-3xl font-semibold tracking-wide text-[#d8b4fe] drop-shadow-[0_0_10px_#a855f766]">
        Limb
      </span>
    </div>
  );
};

const Title = ({ text }: { text: string }) => {
  return (
    <h6 className="uppercase tracking-widest text-[#9f87d0] text-sm font-light">
      {text}
    </h6>
  );
};
